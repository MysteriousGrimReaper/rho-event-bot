/* eslint-disable no-async-promise-executor */
/* eslint-disable no-mixed-spaces-and-tabs */
const {
	SlashCommandBuilder,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} = require("discord.js");

const wait = require("node:timers/promises").setTimeout;
const path = require("path");
const { dir } = require("../dir.json");
const signup_path = path.join(dir, `/tools/signup.js`);
const { create_signup } = require(signup_path);
const game_path = path.join(dir, `/tools/game.js`);
const Game = require(game_path);
const levenshteinDistance = (s, t) => {
	if (!s.length) return t.length;
	if (!t.length) return s.length;
	const arr = [];
	for (let i = 0; i <= t.length; i++) {
		arr[i] = [i];
		for (let j = 1; j <= s.length; j++) {
			arr[i][j] =
				i === 0
					? j
					: Math.min(
							arr[i - 1][j] + 1,
							arr[i][j - 1] + 1,
							arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
					  );
		}
	}
	return arr[t.length][s.length];
};
class Prompt {
	constructor(data) {
		this.answer = data[0].toLowerCase();
		this.clues = data.slice(1, 7);
	}
}
const rules_embed = [
	new EmbedBuilder()
		.setTitle(`Description Detective Rules`)
		.setDescription(
			`You'll be given a set of clues in the game channel, and your goal is to guess what word the clues are referring to.\nType your guesses in the bot's DMs.\nYou'll get points based off how fast you score. You can guess **as many times** as you like, but getting the answer wrong decreases the amount of points you receive by 5.\nYou cannot receive less than 20 points for a correct answer.\nIf the bot reacts to your message with ⚠️, your answer is very close.`
		),
];
module.exports = {
	data: new SlashCommandBuilder()
		.setName("detective")
		.setDescription("Starts a game of Description Detective.")
		.addIntegerOption((option) =>
			option
				.setName("interval")
				.setDescription(
					"How many seconds should the bot wait before posting the next clue? (Default: 15)"
				)
		)
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
			game_name: "Description Detective",
			minutes: 10,
			channel: game_channel,
			join_modal: using_custom_prompts ? clue_modal : null,
			rules: rules_embed,
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
						`Type your answer and clues, separated by line breaks. Example: \`\`\`\nanswer\nclue1\nclue2\nclue3\nclue4\nclue5\nclue6\`\`\``
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
						console.log(response_processing);
						if (response_processing.length < 7) {
							return;
						}
						const get_prompt = new Prompt(response_processing);
						console.log(get_prompt);
						if (get_prompt.clues?.length != 6) {
							return;
						}
						true_prompts.push(get_prompt);
						message.reply(
							`New prompt added:\nAnswer: ${
								get_prompt.answer
							}\nClues:\n- ${get_prompt.clues.join(
								`\n- `
							)}\n\nType \`done\` when you are finished adding prompts.`
						);
					});
				}
			});
		};
		const play_set = async (prompt_list, index, game) => {
			await game_channel.send(`# New round starting!`);
			await wait(5000);
			/**
			 * IDs of the user who guessed correctly
			 */
			const players_guessed = [];
			/**
			 * @param guesser: (String) ID of the user who guessed
			 * @param guess: (String) their guess
			 */
			const guesses_this_interval = [];
			/**
			 * @param guesser: (String) ID of the user who guessed
			 * @param guess: (String) their guess
			 */
			const close_guesses_this_interval = [];
			const init_time = new Date();
			const log_guesses = async (message) => {
				simulator_values.push(message);
				const messageTime = new Date();
				const time_elapsed = messageTime - init_time;
				const current_points = Math.ceil(
					(160000 - time_elapsed) / 1000 -
						4 *
							guesses_this_interval.filter(
								(g) => g.guesser == message.author.id
							).length
				);
				if (
					message.guildId ||
					message.author.bot ||
					players_guessed.includes(message.author.id)
				) {
					return;
				}
				if (
					message.content.toLowerCase() == prompt_list[index].answer
				) {
					game.addPoints(
						message.author,
						Math.max(20, current_points)
					);
					await game_channel.send(
						`${message.author} got the answer!`
					);
					guesses_this_interval.push({
						guesser: message.author.id,
						guess: message.content.toLowerCase(),
					});
					players_guessed.push(message.author.id);
					return;
				} else if (
					levenshteinDistance(
						message.content.toLowerCase(),
						prompt_list[index].answer
					) <= 1
				) {
					close_guesses_this_interval.push({
						guesser: message.author.id,
						guess: message.content.toLowerCase(),
					});
					message.react(`⚠️`);
				} else {
					guesses_this_interval.push({
						guesser: message.author.id,
						guess: message.content.toLowerCase(),
					});
					message.react(`❌`);
					return;
				}
			};
			interaction.client.on("messageCreate", log_guesses);
			let i = 0;
			while (i < 6) {
				await game_channel.send(
					`## ${i + 1}. ${prompt_list[index].clues[i]}`
				);
				await wait(30 * 1000);
				if (
					game.player_list
						.map((p) => p.id)
						.every((v) => players_guessed.includes(v))
				) {
					break;
				}
				i++;
			}
			await game_channel.send(
				`The answer was **${prompt_list[index].answer}**! `
			);
			interaction.client.removeListener("messageCreate", log_guesses);
			/**
			 * Guesses that were either 3 or less levenshtein distance away,
			 * @param guesser: (String) ID of the user who guessed
			 * @param guess: (String) their guess
			 */
			await wait(2 * 1000);
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
			while (players_guessed.length) {
				players_guessed.pop();
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
