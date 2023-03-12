/* eslint-disable no-async-promise-executor */
const {
	SlashCommandBuilder,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1)); // Generate random index from 0 to i
		[array[i], array[j]] = [array[j], array[i]]; // Swap elements at i and j
	}
	return array;
}
const wait = require("node:timers/promises").setTimeout;
const path = require("path");
const { dir } = require("../dir.json");
const signup_path = path.join(dir, `/tools/signup.js`);
const { create_signup } = require(signup_path);
const game_path = path.join(dir, `/tools/game.js`);
const Game = require(game_path);
class Prompt {
	constructor(data) {
		this.answer = data[0].toLowerCase();
		this.clues = data.slice(1, 7);
	}
}
const emojis = ["💠", "🔱", "♻️", "♨️", "🔰"];
class Question {
	constructor(data) {
		this.answers = data.slice(1, 6);
		this.question = data[0];
		this.correct_answer = this.answers[0];
		this.shuffled_answers = shuffleArray(this.answers);
		this.correct_answer_index = this.shuffled_answers.indexOf(
			this.correct_answer
		);
	}
	get answer_text() {
		return this.shuffled_answers
			.map((e, index) => {
				return `${emojis[index]} ${e}`;
			})
			.join(`\n`);
	}
}
const rules_embed = [
	new EmbedBuilder()
		.setTitle(`Kahoot Rules`)
		.setDescription(
			`Choose the right answer. If you're correct, you gain points based on how fast you were.`
		),
];
module.exports = {
	data: new SlashCommandBuilder()
		.setName("kahoot")
		.setDescription("Starts a game of Kahoot.")
		.addBooleanOption((option) =>
			option
				.setName("custom")
				.setDescription(
					"Are you making custom prompts? (Default: false)"
				)
		),
	async execute(interaction) {
		const simulator_values = [];
		const clue_modal = new ModalBuilder()
			.setCustomId(`clue_modal`)
			.setTitle(`Clue`);
		const wordInput = new TextInputBuilder()
			.setCustomId(`word`)
			.setLabel(`Word for others to guess:`)
			.setStyle(TextInputStyle.Short);
		const cluesInput = new TextInputBuilder()
			.setCustomId(`clues`)
			.setLabel(`Clues (1st to last, separate by line breaks):`)
			.setStyle(TextInputStyle.Paragraph);
		const firstActionRow = new ActionRowBuilder().addComponents(wordInput);
		const secondActionRow = new ActionRowBuilder().addComponents(
			cluesInput
		);
		clue_modal.addComponents(firstActionRow, secondActionRow);
		const game_channel = interaction.channel;
		const using_custom_prompts =
			interaction.options.getBoolean(`custom`) ?? false;
		const player_list = await create_signup({
			interaction,
			game_name: "Kahoot",
			minutes: 10,
			min_players: 1,
			channel: game_channel,
			join_modal: using_custom_prompts ? clue_modal : null,
			rules: rules_embed,
			embed_color: 0x46178f,
		});
		const prompt_making = async () => {
			return new Promise(async (resolve) => {
				if (using_custom_prompts) {
					const prompts = player_list.map((x) => x[`submission`]);

					const words = prompts.map(
						(prompt) => prompt.get(`word`)[`value`]
					);
					const clues = prompts.map((prompt) =>
						prompt.get(`clues`)[`value`].split(`\n`).length == 1
							? prompt.get(`clues`)[`value`].split(`,`)
							: prompt.get(`clues`)[`value`].split(`\n`)
					);
					const true_prompts = words.map(
						(word, index) => new Prompt([word, ...clues[index]])
					);
					resolve(true_prompts);
				} else {
					const dm_message = await interaction.user.send(
						`Type your answer and clues, separated by line breaks. Example: \`\`\`\nQuestion\nCorrect answer\nIncorrect answer\nIncorrect answer3\nIncorrect answer4\nIncorrect answer5\`\`\``
					);
					const filter = (m) => !m.author.bot;
					const prompt_collector =
						dm_message.channel.createMessageCollector({
							filter,
						});
					const true_prompts = [];
					prompt_collector.on(`collect`, (message) => {
						if (message.content.toLowerCase() == `done`) {
							prompt_collector.stop();
							resolve(true_prompts);
							return;
						}
						const response_processing =
							message.content.split(`\n`).length == 1
								? message.content.split(`,`)
								: message.content.split(`\n`);
						if (response_processing.length < 3) {
							return;
						}
						const get_prompt = new Question(response_processing);
						if (
							get_prompt.answers?.length < 2 ||
							get_prompt.answers?.length > 5
						) {
							return;
						}
						true_prompts.push(get_prompt);
						message.reply(
							`New question added: ${
								get_prompt.question
							}\nAnswers:\n- ${get_prompt.answers.join(
								`\n- `
							)}\n\nType \`done\` when you are finished adding prompts.`
						);
					});
				}
			});
		};
		const play_set = async (prompt_list, index, game) => {
			const responses = [];
			await game_channel.send(`# New round starting!`);
			await wait(5000);
			await game_channel.send(`# ${prompt_list[index].question}`);
			await wait(prompt_list[index].question.length * 180);

			const button_react = (i) => {
				const { customId, user, createdAt } = i;
				const user_id = user.id;
				responses.push({ user_id, customId, user, createdAt });
				simulator_values.push({ user_id, customId, user, createdAt });
				i.reply({ content: `Skill issue?`, ephemeral: true });
			};
			interaction.client.on("interactionCreate", button_react);
			console.log(prompt_list[index].answer_text);
			const answer_embed = new EmbedBuilder()
				.setTitle(`${prompt_list[index].question}`)
				.setColor(0x888888)
				.setDescription(prompt_list[index].answer_text);
			const choices = prompt_list[index].answers.map((answer, i) => {
				return new ButtonBuilder()
					.setCustomId(prompt_list[index].shuffled_answers[i])
					.setEmoji(emojis[i])
					.setStyle(ButtonStyle.Secondary);
			});

			const choice_row = new ActionRowBuilder().setComponents(...choices);
			await game_channel.send({
				embeds: [answer_embed],
				components: [choice_row],
			});
			const init_time = new Date();
			await wait(20000);
			await game_channel.send(
				`The answer was **${prompt_list[index].correct_answer}**! `
			);
			interaction.client.removeListener(
				"interactionCreate",
				button_react
			);
			responses
				.reduce((acc, current) => {
					const existingIndex = acc.findIndex(
						(item) => item.user_id === current.user_id
					);
					if (existingIndex !== -1) {
						acc[existingIndex] = current; // Replace existing object with the latest one
					} else {
						acc.push(current); // If the object is not found, add it to the accumulator
					}
					return acc;
				}, [])
				.filter((i) => {
					return (
						i.customId.trim() ==
						prompt_list[index].correct_answer.trim()
					);
				})
				.forEach(async (i) => {
					const points_awarded =
						Math.round(((init_time - i.createdAt) / 20000) * 1200) +
						800;
					await i.user.send(`You earned ${points_awarded} points!`);
					game.addPoints(i.user, points_awarded);
				});
			await wait(5 * 1000);
			const score_embed = new EmbedBuilder()
				.setTitle(`Leaderboard`)
				.setDescription(
					game.leaderboardString({
						winner: prompt_list.length == index + 1,
					})
				);
			await game_channel.send({
				content: `Here are the scores:`,
				embeds: [score_embed],
			});
			await wait(5 * 1000);

			if (prompt_list.length == index + 1) {
				await game_channel.send(
					`**${
						game.leaderboard.sort((a, b) => b.score - a.score)[0]
							.player
					} has won!**`
				);
				console.log(simulator_values);
				return;
			}
			play_set(prompt_list, index + 1, game);
		};
		if (player_list !== null) {
			await prompt_making().then(async (prompt_list) => {
				await game_channel.send(
					`Game starting in 5 seconds!\n${
						using_custom_prompts
							? player_list.map((player) => player[`user`])
							: player_list
					}`
				);
				await wait(5000);
				const detective_game = new Game(
					using_custom_prompts
						? player_list.map((player) => player[`user`])
						: player_list
				);
				play_set(prompt_list, 0, detective_game);
			});
		} else {
			// Game closed due to inactivity
		}
	},
};
