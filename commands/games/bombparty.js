/* eslint-disable no-inner-declarations */
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
const fs = require("fs");
const { clearInterval } = require("timers");
const word_array = fs.readFileSync("dict.txt").toString().split("\r\n");
const wait = require("node:timers/promises").setTimeout;
const path = require("path");
const { dir } = require("../dir.json");
const signup_path = path.join(dir, `/tools/signup.js`);
const { create_signup } = require(signup_path);
const rules_embed = [
	new EmbedBuilder()
		.setTitle(`Bomb Party Rules`)
		.setDescription(
			`You'll be given a set of letters. Type a word as quickly as you can that contains those three letters in that order.`
		),
];
function removeCharacters(str1, str2) {
	// Convert str2 into a Set for faster lookup
	const charSet = new Set(str2);

	// Filter out characters from str1 that are present in str2
	const result = str1
		.split("")
		.filter((char) => !charSet.has(char))
		.join("");

	return result;
}
const alphabet = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`;
function createArrayOfZeroes(n) {
	return Array.from({ length: n }, () => 0);
}
function createArrayOfNumber(n, num) {
	const array = [];
	for (let i = 0; i <= n; i++) {
		array.push(num);
	}
	return array;
}
function createArrayOfAlphabet(n) {
	return Array.from({ length: n }, () => alphabet);
}
class Player {
	constructor({ player, lives }) {
		this.player = player;
		this.lives = lives;
		this.letters = alphabet;
		this.words = [];
	}
	check_letters(message) {
		this.letters = removeCharacters(
			this.letters,
			message.content.toUpperCase()
		);
		if (this.letters.length == 0) {
			this.lives++;
			this.letters = alphabet;
			message.react(`💕`);
		}
		return this;
	}
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName("bp")
		.setDescription("Starts a game of Bomb Party.")
		.addIntegerOption((option) =>
			option
				.setName("minppw")
				.setDescription(
					"What's the minimum number of words a prompt should have? (Default: 100)"
				)
		)
		.addIntegerOption((option) =>
			option
				.setName("maxppw")
				.setDescription(
					"What's the maximum number of words a prompt should have? Set to 0 for no limit. (Default: 0)"
				)
		)
		.addIntegerOption((option) =>
			option
				.setName("mintime")
				.setDescription(
					"What's the minimum amount of time the bomb should take before exploding? (Default: 5)"
				)
		)
		.addIntegerOption((option) =>
			option
				.setName("lives")
				.setDescription(
					"How many lives does each player start with? (Default: 2)"
				)
		),
	async execute(interaction) {
		function makeid(length) {
			let result = "";
			const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			const charactersLength = characters.length;
			for (let i = 0; i < length; i++) {
				result += characters.charAt(
					Math.floor(Math.random() * charactersLength)
				);
			}
			return result;
		}
		const min_time =
			(interaction.options.getInteger(`mintime`) ?? 5) * 1000;
		const minppw = Math.max(
			1,
			interaction.options.getInteger(`minppw`) ?? 100
		);
		const maxppw = Math.max(
			interaction.options.getInteger(`maxppw`) ?? 0,
			0
		);
		const lives = Math.max(1, interaction.options.getInteger(`lives`) ?? 2);
		const simulator_values = [];
		const game_channel = interaction.channel;
		const player_list = await create_signup({
			interaction,
			game_name: "Bomb Party",
			minutes: 4,
			min_players: 1,
			channel: game_channel,
			rules: rules_embed,
		});
		if (player_list !== null) {
			const game_player_list = player_list.map(
				(p) => new Player({ player: p, lives, letters: alphabet })
			);
			const words_used = [];
			const eliminated_list = [];
			await game_channel.send(
				`Game starting in **5 seconds**!\n${player_list.join(``)}`
			);
			await wait(5000);
			let current_turn_index = 0;
			const filter = (m) => !m.author.bot;
			const message_collector = game_channel.createMessageCollector({
				filter,
			});
			const find_valid_prompt = () => {
				let prompt = makeid(3);
				while (
					word_array.filter((w) => w.includes(prompt)).length <
						minppw &&
					(maxppw == 0 ||
						word_array.filter((w) => w.includes(prompt)).length >
							maxppw)
				) {
					prompt = makeid(3);
				}
				return prompt;
			};
			const prompt_cache = [find_valid_prompt()];
			const refill_cache = setInterval(() => {
				while (prompt_cache.length < 10) {
					prompt_cache.push(find_valid_prompt());
				}
			}, 1000);
			let current_prompt = prompt_cache[0];
			await game_channel.send(
				`${game_player_list[current_turn_index].player}\n:bomb: **${current_prompt}**`
			);
			const eliminate = async () => {
				await game_channel.send(
					`:boom: **The bomb exploded on ${game_player_list[current_turn_index].player}!** (${game_player_list[current_turn_index].lives} lives remaining)`
				);
				prompt_cache.shift();
				game_player_list[current_turn_index].lives--;
				if (game_player_list[current_turn_index].lives <= 0) {
					eliminated_list.unshift(
						game_player_list.slice(current_turn_index, 1)
					);
					current_turn_index--;
				}
				if (game_player_list.length == 0) {
					const leaderboard_embed = new EmbedBuilder()
						.setTitle(`Leaderboard`)
						.setDescription(
							`:crown: ${eliminated_list
								.map((p) => {
									return `${p.player} (${p.words.length})`;
								})
								.join(`\n`)}`
						)
						.setColor(0xaa0000);
					await game_channel.send({ embeds: [leaderboard_embed] });
					await wait(3000);
					await game_channel.send(
						`**${eliminated_list[0].player} has won!**`
					);
					clearInterval(refill_cache);
					message_collector.stop();
					return;
				}
				clearTimeout(bomb_timeout);
				current_turn_index++;
				current_turn_index %= game_player_list.length;

				current_prompt = prompt_cache[0];
				await game_channel.send(
					`${game_player_list[current_turn_index].player}\n:bomb: **${current_prompt}**`
				);
				bomb_timeout = setTimeout(
					await eliminate,
					min_time + 15000 * Math.random()
				);
			};
			let bomb_timeout = setTimeout(
				await eliminate,
				min_time + 15000 * Math.random()
			);
			message_collector.on("collect", async (m) => {
				const m_content = m.content.toUpperCase().replace(/[^A-Z]/, ``);
				if (
					m.author.id ==
						game_player_list[current_turn_index].player.id &&
					m_content.includes(current_prompt) &&
					word_array.includes(m_content)
				) {
					if (words_used.includes(m_content)) {
						m.react(`🔒`);
						return;
					}
					clearTimeout(bomb_timeout);
					game_player_list[current_turn_index].words.push(m_content);
					game_player_list[current_turn_index].check_letters(m);
					current_turn_index++;
					current_turn_index %= game_player_list.length;
					prompt_cache.shift();
					current_prompt = prompt_cache[0];
					await game_channel.send(
						`${game_player_list[current_turn_index]}\n:bomb: **${current_prompt}**`
					);
					bomb_timeout = setTimeout(
						await eliminate,
						min_time + 15000 * Math.random()
					);
				}
			});
		} else {
			// Game closed due to inactivity
		}
	},
};
