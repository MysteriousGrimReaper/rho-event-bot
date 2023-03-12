/* eslint-disable no-case-declarations */
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
	EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const { dir } = require("../dir.json");
const signup_path = path.join(dir, `/tools/signup.js`);
const { create_signup } = require(signup_path);
const game_path = path.join(dir, `/tools/game.js`);
const Game = require(game_path);
function createEmptyArray(m, n) {
	const emptyArray = [];

	for (let i = 0; i < m; i++) {
		const row = [];
		for (let j = 0; j < n; j++) {
			row.push(null); // You can use null, undefined, or any other default value
		}
		emptyArray.push(row);
	}

	return emptyArray;
}
function letterToNumber(str) {
	str = str.toLowerCase(); // Convert the input string to lowercase for case insensitivity
	let result = 0;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i) - 96; // Get the character code of the letter and subtract 96 to map 'a' to 1, 'b' to 2, and so on.
		result = result * 26 + char;
	}

	return result;
}

class ImperialismGame extends Game {
	constructor(player_list) {
		super(player_list);
		this.board = createEmptyArray(player_list.length, player_list.length);
		for (let i = 0; i < player_list.length; i++) {
			let coordinate_x = Math.floor(Math.random() * this.board.length);
			let coordinate_y = Math.floor(
				Math.random() * this.board[coordinate_x].length
			);
			let placed = false;

			while (!placed) {
				// keep trying to assign the player to a point
				if (this.board[coordinate_x][coordinate_y] == null) {
					this.board[coordinate_x][coordinate_y] =
						this.username_list[i];
					placed = true;
				} else {
					coordinate_x = Math.floor(
						Math.random() * this.board.length
					);
					coordinate_y = Math.floor(
						Math.random() * this.board[coordinate_x].length
					);
				}
			}
		}
		console.log(this.board);
	}
	display_board(player_emojis) {
		function createRow(row) {
			return row
				.map((cell) => (cell === null ? "⬛" : player_emojis[cell]))
				.join("");
		}
		return this.board.map((row) => createRow(row)).join("\n");
	}
}
function isEmoji(str) {
	// Define a regular expression to match emoji characters
	const emojiRegex = /[\p{Emoji}]/gu;

	// Use the regular expression to find emoji characters in the string
	const emojiMatches = str.match(emojiRegex);

	// Check if the matched emoji characters cover the entire string
	return emojiMatches !== null && str === emojiMatches.join("");
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName("imperialism")
		.setDescription("Starts a game of Imperialism."),
	async execute(interaction) {
		const player_list = await create_signup({
			interaction,
			game_name: `Imperialism`,
		});
		if (player_list !== null) {
			// game start
			const player_emojis = {};
			player_list.forEach(async (player) => {
				const filter = (m) =>
					!m.author.bot && isEmoji(m.content) && m.content != `⬛`;
				await player.send(
					`Type a emoji to represent yourself during the game. (Some emojis may not work. If I do not respond try a different emoji.)`
				);
				const emoji_collector = player.dmChannel.createMessageCollector(
					{ filter }
				);

				emoji_collector.on(`collect`, (message) => {
					if (
						Object.values(player_emojis).includes(message.content)
					) {
						player.send(
							`Someone's already taken that emoji, try another.`
						);
					} else {
						player_emojis[player.username] = message.content;
						player.send(`Emoji set to ${message.content}!`);
						emoji_collector.stop();
					}
				});

				emoji_collector.on(`end`, () => {
					if (
						Object.keys(player_emojis).length == player_list.length
					) {
						start_game();
					}
				});
			});
			const game = new ImperialismGame(player_list);
			const start_game = () => {
				player_list.forEach(async (player) => {
					let game_state = `select`; // select = selecting a tile, attack = playing minigame
					await player.send(`${game.display_board(player_emojis)}`);
					const filter = (m) => !m.author.bot;
					const action_collector =
						player.dmChannel.createMessageCollector({ filter });
					action_collector.on(`collect`, async (message) => {
						switch (game_state) {
							case `select`:
								const letter_coord = letterToNumber(
									message.content.replace(/[^a-zA-Z]/g, "")
								);
								const number_coord = parseInt(message.content);
								const square_selected =
									game.board[number_coord][letter_coord];
								if (square_selected == undefined) {
									message.reply(`That's out of bounds...`);
									return;
								}
								if (
									game.board[number_coord + 1][
										letter_coord
									] == player.username ||
									game.board[number_coord - 1][
										letter_coord
									] == player.username ||
									game.board[number_coord][
										letter_coord + 1
									] == player.username ||
									game.board[number_coord][
										letter_coord - 1
									] == player.username
								) {
									message.reply(
										`Attacking square ${message.content.replace(
											/[^a-zA-Z]/g,
											""
										)}${parseInt(message.content)}...`
									);
									game_state = `attack`;
									// put the code that starts the attack here
								} else {
									message.reply(
										`You can't attack that square, you're not close enough.`
									);
								}
								break;
							case `attack`:
								// this is for collecting the actual attack action
								break;
						}
					});
				});
			};
		} else {
			// Game closed due to inactivity
		}
	},
};
