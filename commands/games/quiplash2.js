/* eslint-disable no-async-promise-executor */
/* eslint-disable comma-dangle */
/* eslint-disable no-inner-declarations */
const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
const randomColor = require("randomcolor");
const path = require("path");
const fs = require(`fs`);
const { dir } = require("../dir.json");
const dPath_game = path.join(dir, "game-lists/");
const full_prompt_list = fs
	.readFileSync(path.join(dPath_game, "quiplash.txt"))
	.toString()
	.split("\n");
const wait = require("node:timers/promises").setTimeout;
const signup_path = path.join(dir, `/tools/signup.js`);
const { create_signup } = require(signup_path);
class Player {
	constructor(user) {
		this.user = user;
		this.score = 0;
		this.prompts = [];
		this.responses = [];
	}
	setPrompts(array) {
		this.prompts = array;
		return this;
	}
	resetEntries() {
		this.prompts = [];
		this.responses = [];
		return this;
	}
	fillEmptyResponses() {
		while (this.prompts.length > this.responses.length) {
			this.responses.push(`[NO ANSWER]`);
		}
		return this;
	}
	get has_responded() {
		return this.responses.length == this.prompts.length;
	}
	get name() {
		return this.user.globalName ?? this.user.username;
	}
	addPoints(points) {
		this.score += Math.round(points);
		return this;
	}
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName("quiplash2")
		.setDescription("Bigger and better!"),

	async execute(interaction) {
		const rules = [
			new EmbedBuilder()
				.setTitle(`Quiplash`)
				.setDescription(
					`Respond to the prompts you're given, then vote on which responses you enjoy the most.`
				),
		];
		const user_list = await create_signup({
			interaction,
			game_name: "Quiplash",
			minutes: 10,
			channel: interaction.channel,
			min_players: 3,
			rules,
			embed_color: Math.floor(Math.random() * 0xffffff),
		});
		if (user_list !== null) {
			const prompt_list = shuffle(full_prompt_list);
			let player_list = user_list.map((user) => new Player(user));
			const listener = async (message) => {
				const player = player_list.find(
					(p) => p.user.id == message.author.id
				);
				if (
					message.channel.isDMBased() &&
					player &&
					player?.responses?.length < player?.prompts?.length
				) {
					player.responses.push(message.content);
					const responded_embed = new EmbedBuilder()
						.setTitle(`Your response has been recorded as:`)
						.setDescription(message.content);
					await message.reply({ embeds: [responded_embed] });
					if (player?.responses?.length < player?.prompts?.length) {
						await message.channel.send(
							`${player.prompts[player.responses.length]}`
						);
					}
				}
			};
			let initial_start_message;
			const play_round = async (round) => {
				player_list = shuffle(player_list);
				player_list.forEach((p) => p.resetEntries());
				const start_message = await interaction.channel.send(
					`The round has started! Answer the prompts you're given.`
				);
				if (round == 1) {
					initial_start_message = start_message;
				}
				let round_prompt_list = prompt_list.slice(
					(round - 1) * player_list.length,
					round * player_list.length
				);
				round_prompt_list.forEach((text, index) => {
					round_prompt_list[index] = text.replace(
						`<ANYPLAYER>`,
						player_list[
							Math.floor(Math.random() * player_list.length)
						].name
					);
				});
				round_prompt_list = shuffle(round_prompt_list);
				round_prompt_list.push(round_prompt_list[0]);
				interaction.client.on("messageCreate", listener);
				player_list.forEach(async (player, index) => {
					player.setPrompts(
						round_prompt_list.slice(index, index + 2)
					);
					try {
						await player.user.send(player.prompts[0]);
					} catch {
						await interaction.channel.send(
							`${player.user}, make sure you have your DMs open!`
						);
					}
				});
				const snowflake = start_message.id;
				const time =
					Math.round(
						Number((BigInt(snowflake) >> 22n) + 1420070400000n) /
							1000
					) +
					20 +
					120; // change to 120
				await interaction.channel.send(
					`You have until **<t:${time}:t>**, which is **<t:${time}:R>**.`
				);
				const all_have_responded = () => {
					return player_list
						.map((p) => p.has_responded)
						.reduce((acc, cv) => acc && cv, true);
				};
				while (
					!(
						time < new Date().getTime() / 1000 ||
						all_have_responded()
					)
				) {
					await wait(8000);
				}
				await interaction.channel.send(
					`${user_list.join(` `)}\n${
						all_have_responded()
							? `All responses are in!`
							: `Time's up!`
					} Here are the responses:`
				);
				player_list.forEach((p) => p.fillEmptyResponses());
				await wait(2500);
				round_prompt_list.pop();
				class Response {
					constructor(author, content, prompt) {
						this.author = author;
						this.content = content;
						this.prompt = prompt;
					}
				}
				const responses = [];
				player_list.forEach((p) => {
					p.responses.forEach((response, index) => {
						responses.push(
							new Response(p, response, p.prompts[index])
						);
					});
				});
				const get_responses_for_prompt = (prompt) => {
					return responses.filter((r) => r.prompt == prompt);
				};
				for (const i of round_prompt_list) {
					const vote_promise = new Promise(async (resolve) => {
						const current_responses = get_responses_for_prompt(i);
						const vote_a = new ButtonBuilder()
							.setEmoji(`🅰️`)
							.setCustomId(`vote_a`)
							.setStyle(ButtonStyle.Danger);
						const vote_b = new ButtonBuilder()
							.setEmoji(`🅱️`)
							.setCustomId(`vote_b`)
							.setStyle(ButtonStyle.Danger);
						const vote_row = new ActionRowBuilder().setComponents([
							vote_a,
							vote_b,
						]);
						const response_embed = new EmbedBuilder()
							.setTitle(i)
							.setDescription(
								`:a: ${current_responses[0].content}\n:b: ${current_responses[1].content}`
							);
						const vote_message = await interaction.channel.send({
							embeds: [response_embed],
							components: [vote_row],
						});
						const filter = (inter) =>
							!current_responses
								.map((r) => r.author.user.id)
								.includes(inter.user.id);
						const vote_collector =
							vote_message.createMessageComponentCollector({
								time: 25 * 1000,
								filter,
							});

						let a_votes = [];
						let b_votes = [];
						const current_texts = current_responses.map(
							(c) => c.content
						);
						console.log(current_responses);

						vote_collector.on(`collect`, async (choice) => {
							const { customId, user } = choice;
							if (customId == `vote_a`) {
								a_votes = a_votes.filter((id) => id != user.id);
								a_votes.push(user.id);

								if (b_votes.includes(user.id)) {
									b_votes = b_votes.filter(
										(id) => id != user.id
									);
									await choice.reply({
										ephemeral: true,
										content: `You have switched your vote to:\n${current_responses[0].content}`,
									});
								} else {
									await choice.reply({
										ephemeral: true,
										content: `You have voted for:\n${current_responses[0].content}`,
									});
								}
							} else if (customId == `vote_b`) {
								b_votes = b_votes.filter((id) => id != user.id);
								b_votes.push(user.id);

								if (a_votes.includes(user.id)) {
									a_votes = a_votes.filter(
										(id) => id != user.id
									);
									await choice.reply({
										ephemeral: true,
										content: `You have switched your vote to:\n${current_responses[1].content}`,
									});
								} else {
									await choice.reply({
										ephemeral: true,
										content: `You have voted for:\n${current_responses[1].content}`,
									});
								}
							}
						});
						vote_collector.on(`ignore`, async (choice) => {
							await choice.reply({
								ephemeral: true,
								content: `You can't vote, you wrote one of the responses!`,
							});
						});
						vote_collector.on(`end`, async () => {
							await vote_message.edit({
								embeds: [response_embed],
								components: [],
							});
							const total_votes = a_votes.length + b_votes.length;
							const proportion =
								total_votes > 0
									? a_votes.length / total_votes
									: 0.5;
							current_responses[0].author.addPoints(
								round * 1000 * proportion
							);
							current_responses[1].author.addPoints(
								round * 1000 * (1 - proportion)
							);
							await interaction.channel.send(
								`${current_responses[0].author.name} - **${
									a_votes.length
								}** votes (+${Math.round(
									round * 1000 * proportion
								)})\n${current_responses[1].author.name} - **${
									b_votes.length
								}** votes (+${Math.round(
									round * 1000 * (1 - proportion)
								)})`
							);
							if (
								(proportion == 1 || proportion == 0) &&
								total_votes >= 5
							) {
								current_responses[
									1 - proportion
								].author.addPoints(round * 1000 * proportion);
								await wait(500);
								await interaction.channel.send(
									`**QUIPLASH!** (+${500 * round})`
								);
							}
							await wait(3000);
							resolve();
						});
						if (current_texts.includes(`[NO ANSWER]`)) {
							if (current_texts[0] == `[NO ANSWER]`) {
								b_votes.push(`0`);
							}
							if (current_texts[1] == `[NO ANSWER]`) {
								a_votes.push(`0`);
							}
							vote_collector.stop();
						}
					});
					await vote_promise;
				}
				await wait(5000);
				const sorted_players = player_list.toSorted(
					(a, b) => b.score - a.score
				);
				const sorted_text = sorted_players
					.map(
						(p, index) =>
							`${p.name} - ${p.score} ${
								index == 0 && round == 3 ? `:crown:` : ``
							}`
					)
					.join(`\n`);
				const leaderboard_embed = new EmbedBuilder()
					.setTitle(`Leaderboard`)
					.setDescription(sorted_text)
					.setThumbnail(sorted_players[0].user.displayAvatarURL())
					.setFooter({ text: `Round ${round}/3` });
				await interaction.channel.send({ embeds: [leaderboard_embed] });
				await wait(10000);
				// end
				await interaction.client.off("messageCreate", listener);
				if (round == 3) {
					await interaction.channel.send(
						`## :tada: Congratulations, ${sorted_players[0].user}! :tada:`
					);
					await wait(10000);
					return await interaction.channel.send(
						`\`\`\`Quiplash\`\`\`\n:first_place: ${sorted_players[0].user}\n:second_place: ${sorted_players[1].user}\n:third_place: ${sorted_players[2].user}\n${initial_start_message?.url}`
					);
				} else {
					await play_round(round + 1);
				}
			};
			await play_round(1);
		} else {
			await interaction.channel.send(`Game closed due to inactivity.`);
		}
	},
};
