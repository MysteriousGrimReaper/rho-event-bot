/* eslint-disable no-unused-vars */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-case-declarations */
const wait = require("node:timers/promises").setTimeout;
const color_map = {
	Red: "Red",
	Green: "Green",
	Blue: "Blue",
	Yellow: "Yellow",
	Orange: "Orange",
	Pink: "LuminousVividPink",
	Violet: "Purple",
	Teal: "Aqua",
};
function getOccurrence(array, value) {
	let count = 0;
	array.forEach((v) => v === value && count++);
	return count;
}
const mode = (a) => {
	a = a.slice().sort((x, y) => x - y);

	let bestStreak = 1;
	let bestElem = a[0];
	let currentStreak = 1;
	let currentElem = a[0];

	for (let i = 1; i < a.length; i++) {
		if (a[i - 1] !== a[i]) {
			if (currentStreak > bestStreak) {
				bestStreak = currentStreak;
				bestElem = currentElem;
			}

			currentStreak = 0;
			currentElem = a[i];
		}

		currentStreak++;
	}

	return currentStreak > bestStreak ? currentElem : bestElem;
};
function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
}
// initialize cards
const light_base_cards = [
	"Red 1",
	"Red 2",
	"Red 3",
	"Red 4",
	"Red 5",
	"Red 6",
	"Red 7",
	"Red 8",
	"Red 9",
	"Red 1",
	"Red 2",
	"Red 3",
	"Red 4",
	"Red 5",
	"Red 6",
	"Red 7",
	"Red 8",
	"Red 9",
	"Red Skip",
	"Red Skip",
	"Red Reverse",
	"Red Reverse",
	"Red +1",
	"Red +1",
	"Red Flip",
	"Red Flip",
	"Blue 1",
	"Blue 2",
	"Blue 3",
	"Blue 4",
	"Blue 5",
	"Blue 6",
	"Blue 7",
	"Blue 8",
	"Blue 9",
	"Blue 1",
	"Blue 2",
	"Blue 3",
	"Blue 4",
	"Blue 5",
	"Blue 6",
	"Blue 7",
	"Blue 8",
	"Blue 9",
	"Blue Skip",
	"Blue Skip",
	"Blue Reverse",
	"Blue Reverse",
	"Blue +1",
	"Blue +1",
	"Blue Flip",
	"Blue Flip",
	"Green 1",
	"Green 2",
	"Green 3",
	"Green 4",
	"Green 5",
	"Green 6",
	"Green 7",
	"Green 8",
	"Green 9",
	"Green 1",
	"Green 2",
	"Green 3",
	"Green 4",
	"Green 5",
	"Green 6",
	"Green 7",
	"Green 8",
	"Green 9",
	"Green Skip",
	"Green Skip",
	"Green Reverse",
	"Green Reverse",
	"Green +1",
	"Green +1",
	"Green Flip",
	"Green Flip",
	"Yellow 1",
	"Yellow 2",
	"Yellow 3",
	"Yellow 4",
	"Yellow 5",
	"Yellow 6",
	"Yellow 7",
	"Yellow 8",
	"Yellow 9",
	"Yellow 1",
	"Yellow 2",
	"Yellow 3",
	"Yellow 4",
	"Yellow 5",
	"Yellow 6",
	"Yellow 7",
	"Yellow 8",
	"Yellow 9",
	"Yellow Skip",
	"Yellow Skip",
	"Yellow Reverse",
	"Yellow Reverse",
	"Yellow +1",
	"Yellow +1",
	"Yellow Flip",
	"Yellow Flip",
	"Wild",
	"Wild +2",
	"Wild",
	"Wild +2",
	"Wild",
	"Wild +2",
	"Wild",
	"Wild +2",
];
const dark_base_cards = [
	"Teal 1",
	"Teal 2",
	"Teal 3",
	"Teal 4",
	"Teal 5",
	"Teal 6",
	"Teal 7",
	"Teal 8",
	"Teal 9",
	"Teal 1",
	"Teal 2",
	"Teal 3",
	"Teal 4",
	"Teal 5",
	"Teal 6",
	"Teal 7",
	"Teal 8",
	"Teal 9",
	"Teal Skip Everyone",
	"Teal Skip Everyone",
	"Teal Reverse",
	"Teal Reverse",
	"Teal +5",
	"Teal +5",
	"Teal Flip",
	"Teal Flip",
	"Violet 1",
	"Violet 2",
	"Violet 3",
	"Violet 4",
	"Violet 5",
	"Violet 6",
	"Violet 7",
	"Violet 8",
	"Violet 9",
	"Violet 1",
	"Violet 2",
	"Violet 3",
	"Violet 4",
	"Violet 5",
	"Violet 6",
	"Violet 7",
	"Violet 8",
	"Violet 9",
	"Violet Skip Everyone",
	"Violet Skip Everyone",
	"Violet Reverse",
	"Violet Reverse",
	"Violet +5",
	"Violet +5",
	"Violet Flip",
	"Violet Flip",
	"Pink 1",
	"Pink 2",
	"Pink 3",
	"Pink 4",
	"Pink 5",
	"Pink 6",
	"Pink 7",
	"Pink 8",
	"Pink 9",
	"Pink 1",
	"Pink 2",
	"Pink 3",
	"Pink 4",
	"Pink 5",
	"Pink 6",
	"Pink 7",
	"Pink 8",
	"Pink 9",
	"Pink Skip Everyone",
	"Pink Skip Everyone",
	"Pink Reverse",
	"Pink Reverse",
	"Pink +5",
	"Pink +5",
	"Pink Flip",
	"Pink Flip",
	"Orange 1",
	"Orange 2",
	"Orange 3",
	"Orange 4",
	"Orange 5",
	"Orange 6",
	"Orange 7",
	"Orange 8",
	"Orange 9",
	"Orange 1",
	"Orange 2",
	"Orange 3",
	"Orange 4",
	"Orange 5",
	"Orange 6",
	"Orange 7",
	"Orange 8",
	"Orange 9",
	"Orange Skip Everyone",
	"Orange Skip Everyone",
	"Orange Reverse",
	"Orange Reverse",
	"Orange +5",
	"Orange +5",
	"Orange Flip",
	"Orange Flip",
	"Wild",
	"Wild +c",
	"Wild",
	"Wild +c",
	"Wild",
	"Wild +c",
	"Wild",
	"Wild +c",
];
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SlashCommandBuilder,
	EmbedBuilder,
} = require("discord.js");
const randomColor = require("randomcolor");
const current_uno_servers = [];
const rules_embed = new EmbedBuilder()
	.setTitle(`Uno Flip Rules`)
	.setDescription(
		`Welcome to Uno Flip! The goal of the game is to get rid of all the cards in your hand. This is a variant of Uno that uses both sides of the cards. \nFor information on how the game works, the official rules are found on the UNO website: https://unogamerules.com/uno-flip/`
	)
	.addFields({
		name: `Playing Cards`,
		value: `To play cards, simply type the name of the card (Ex. \`yellow 5\`) in the channel you are playing in. You can also play a card via its alias by typing the first letter of the colour and its value (Ex. \`y5\`). For cards that make others draw additional cards, such as Red +1, simply type + as the shorthand (Ex. \`r+\`).`,
	})
	.addFields({
		name: `Drawing Cards`,
		value: `To draw a card, type \`draw\` or \`d\`.`,
	})
	.addFields({
		name: `UNO!`,
		value: `Type \`uno!\` when you have 1 card left to show that you have 1 card left. Otherwise, someone else can type \`callout\` to catch you, and you have to pick up 2 cards.`,
	});
function shuffleArray(array) {
	const shuffledArray = [...array]; // Create a copy of the original array

	for (let i = shuffledArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1)); // Generate a random index

		// Swap elements at index i and j
		[shuffledArray[i], shuffledArray[j]] = [
			shuffledArray[j],
			shuffledArray[i],
		];
	}

	return shuffledArray;
}
let hand_collect_reply_fn;
const get_hand_collect_reply_fn = () => {
	return hand_collect_reply_fn;
};
module.exports = {
	get_hand_collect_reply_fn,
	data: new SlashCommandBuilder()
		.setName("unoflip")
		.setDescription("Starts a game of Uno Flip."),
	async execute(interaction) {
		let button_duration = 30;
		current_uno_servers.push(interaction.guildId);
		const game_channel = interaction.channel;
		const players = [interaction.user];
		const usernames = [interaction.user.username];
		const light_deck = shuffleArray(light_base_cards);
		let side = 0; // 0 = light, 1 = dark
		let turn_index = 0;
		const dark_deck = shuffleArray(dark_base_cards);
		const deck = light_deck.map((element, index) => [
			element,
			dark_deck[index],
		]);
		const discard = [];

		async function start_game() {
			button_duration += 10 * players.length;
			players.forEach((player) => (player.uno = false));
			const hand_button = new ButtonBuilder()
				.setCustomId("unoflip_hand")
				.setLabel("Hand")
				.setStyle(ButtonStyle.Primary);
			const table_button = new ButtonBuilder()
				.setCustomId("unoflip_table")
				.setLabel("Table")
				.setStyle(ButtonStyle.Secondary);
			const game_row = new ActionRowBuilder().addComponents(
				hand_button,
				table_button
			);
			const player_filter = (m) => !m.author.bot;
			const uno_filter = (m) =>
				m.content.toLowerCase() == `uno!` ||
				m.content.toLowerCase().includes(`callout`);
			const move_collector = game_channel.createMessageCollector({
				filter: player_filter,
			});
			const uno_collector = game_channel.createMessageCollector({
				filter: uno_filter,
			});
			let currently_wild = false;
			let turn_order = shuffleArray(
				Array.from({ length: players.length }, (_, index) => index)
			);
			const hands = Array.from(usernames, () => []);
			shuffle(deck);
			hands.forEach(async (element, index) => {
				for (let i = 0; i < 7; i++) {
					element.push(deck.pop());
				}
				await players[index].send(
					`You were dealt the following cards:\n**${element
						.map((x) => x[side])
						.join(` **|** `)}**`
				);
			});
			// console.log(deck[deck.length - 1][side].split(` `)[1]);
			while (
				isNaN(parseInt(deck[deck.length - 1][side].split(` `)[1][0]))
			) {
				deck.unshift(deck.pop());
				// console.log(deck[deck.length - 1][side].split(` `));
			}
			let current_turn = turn_order[turn_index];
			let current_player = players[turn_order[turn_index]];
			await current_player.send(
				`It's your turn! Here is your hand:\n\n**${hands[current_turn]
					.map((x) => x[side])
					.join(` **|** `)}**\n\nYou currently have ${
					hands[current_turn].length
				} cards.`
			);
			discard.push(deck.pop());
			const first_play_embed = new EmbedBuilder()
				.setDescription(
					`The game has started! It's currently ${
						usernames[current_turn]
					}'s turn.\n\nThe first card is a **${
						discard[discard.length - 1][side]
					}**.`
				)
				.setColor(
					color_map[discard[discard.length - 1][side].split(" ")[0]]
				);
			const init_message = await game_channel.send({
				embeds: [first_play_embed],
				components: [game_row],
			});
			const draw_card = async (player = turn_order[turn_index]) => {
				const card_drawn = deck.pop();
				await players[player].send(
					`You drew a **${card_drawn[side]}**!`
				);
				hands[player].push(card_drawn);
				await wait(100);
				if (deck.length == 0) {
					await interaction.channel.send(`Shuffling deck...`);
					while (discard.length > 0) {
						deck.push(discard.pop());
					}
				}
			};
			hand_collect_reply_fn = async (i) => {
				const { customId } = i;
				if (!players.includes(i.user)) {
					await i.reply({
						content: `You aren't in the game...`,
						ephemeral: true,
					});
					return;
				}

				switch (customId) {
					case `unoflip_hand`:
						await i.reply({
							content: `Here is your hand:\n\n**${hands[
								players.indexOf(i.user)
							]
								.map((x) => x[side])
								.join(` **|** `)}**\n\nYou currently have ${
								hands[players.indexOf(i.user)].length
							} cards.`,
							ephemeral: true,
						});
						break;
					case `unoflip_table`:
						await i.reply({
							content: `Here is the table:\n\n${hands
								.map(
									(hand, index) =>
										`**${players[index]} | ${
											hand.length
										} cards**\n**${hand
											.map((card) => card[(side + 1) % 2])
											.join(` | `)}**`
								)
								.join(`\n`)}\nThe turn order is ${turn_order
								.map(
									(player_index, index) =>
										`${index == turn_index ? `**` : ``}${
											usernames[player_index]
										}${index == turn_index ? `**` : ``}`
								)
								.join(` => `)}`,
							ephemeral: true,
						});
						break;
				}
			};
			let move = "";
			const card_alias = (card_name) => {
				return card_name
					.split(` `)
					.map((g) => g[0])
					.join(``);
			};
			uno_collector.on(`collect`, async (message) => {
				if (message.content.toLowerCase() == `uno!`) {
					const uno_player_index = players.indexOf(message.author);
					if (players[uno_player_index].uno) {
						await message.reply(`You already said Uno...`);
					} else if (hands[uno_player_index].length == 1) {
						await interaction.channel.send(
							`**UNO!!** ${message.author.username} has 1 card left!`
						);
						players[uno_player_index].uno = true;
					}
				} else {
					hands.forEach((hand, index) => {
						if (hand.length == 1 && !players[index].uno) {
							game_channel.send(
								`${players[index]}, you forgot to say Uno! Pick up 2 cards.`
							);
							draw_card(index);
							draw_card(index);
						}
					});
				}
			});
			move_collector.on(`collect`, async (message) => {
				console.log(`${message.author.username}: ${message.content}`);
				if (current_player.id != message.author.id) return;
				if (
					players[current_turn].uno &&
					hands[current_turn].length > 1
				) {
					players[current_turn].uno = false;
				}
				// draw
				if (message.content == `draw` || message.content == `d`) {
					// console.log(message.id);
					let draw_message = `${usernames[current_turn]} drew a card.`;
					await draw_card();
					turn_index++;
					turn_index %= players.length;
					draw_message += `\n\nIt's now ${
						usernames[turn_order[turn_index]]
					}'s turn!`;
					const draw_embed = new EmbedBuilder()
						.setDescription(draw_message)
						.setColor(
							color_map[
								discard[discard.length - 1][side].split(" ")[0]
							]
						);
					current_turn = turn_order[turn_index];
					current_player = players[turn_order[turn_index]];
					await current_player.send(
						`It's your turn! Here is your hand:\n\n**${hands[
							current_turn
						]
							.map((x) => x[side])
							.join(` **|** `)}**\n\nYou currently have ${
							hands[current_turn].length
						} cards.`
					);
				} else {
					// play card
					const input = message.content;
					move = input;
					if (move.length <= 0) return;
					const card_played_index = hands[current_turn].findIndex(
						(card) =>
							card[side].toLowerCase() == move.toLowerCase() ||
							card_alias(card[side]).toLowerCase() ==
								move.toLowerCase()
					);
					if (card_played_index == -1) return;
					let color;
					const [played_color, played_number, skip_everyone] =
						hands[current_turn][card_played_index][side].split(` `);
					const [current_color, current_number] =
						discard[discard.length - 1][side].split(` `);
					const isWild = played_color.includes(`Wild`);
					// console.log(`Played color: ${played_color}\nPlayed number: ${played_number}\nCurrent color: ${current_color}\nCurrent number: ${current_number}\nIs wild: ${isWild}`);
					if (
						played_color != current_color &&
						played_number != current_number &&
						!isWild
					) {
						return;
					}
					const card_played = hands[current_turn].splice(
						card_played_index,
						1
					)[0];
					discard.push(card_played);
					// console.log(card_played[side]);
					let game_message = `${usernames[current_turn]} played a **${card_played[side]}**. `;
					// special cards
					if (played_color.includes(`Wild`)) {
						currently_wild = true;
						await interaction.channel.send(
							`Type a color to switch to!`
						);
						const light_colors = [`Red`, `Blue`, `Green`, `Yellow`];
						const dark_colors = [
							`Violet`,
							`Pink`,
							`Orange`,
							`Teal`,
						];

						const color_filter = (m) =>
							m.author.id == current_player.id &&
							(side ? dark_colors : light_colors).findIndex(
								(c) =>
									c.substring(0, 1).toLowerCase() ==
									m.content.substring(0, 1).toLowerCase()
							) >= 0;
						game_channel
							.awaitMessages({
								filter: color_filter,
								max: 1,
								time: 30000,
							})
							.then(async (m) => {
								color = (side ? dark_colors : light_colors)[
									(side
										? dark_colors
										: light_colors
									).findIndex(
										(c) =>
											c.substring(0, 1).toLowerCase() ==
											m
												.first()
												.content.substring(0, 1)
												.toLowerCase()
									)
								];
								discard.push([
									`${color} ${played_color}`,
									`${color} ${played_color}`,
								]);
								game_message += `${current_player.username} switched the color to ${color}. `;
								if (played_number == `+2`) {
									turn_index++;
									turn_index %= players.length;
									for (let i = 0; i < 2; i++) {
										await draw_card();
									}
									game_message += `${
										usernames[turn_order[turn_index]]
									} drew 2 cards! Also, skip a turn!`;
								} else if (played_number == `+c`) {
									turn_index++;
									turn_index %= players.length;
									let cards_drawn = 1;
									hands[turn_order[turn_index]].push(
										deck.pop()
									);
									while (
										hands[turn_order[turn_index]][
											hands[turn_order[turn_index]]
												.length - 1
										][side].split(" ")[0] != color
									) {
										await draw_card();
										cards_drawn++;
									}
									game_message += `${
										usernames[turn_order[turn_index]]
									} drew ${cards_drawn} cards! Also, skip a turn!`;
								}
								turn_index++;
								turn_index %= players.length;
								game_message += `\n\nIt's now ${
									usernames[turn_order[turn_index]]
								}'s turn!`;
								const play_embed = new EmbedBuilder()
									.setDescription(game_message)
									.setColor(
										color_map[
											discard[discard.length - 1][
												side
											].split(" ")[0]
										]
									);
								const play_message = await game_channel.send({
									embeds: [play_embed],
									components: [game_row],
								});
								currently_wild = false;
								current_turn = turn_order[turn_index];
								current_player =
									players[turn_order[turn_index]];
								move = "";
								await current_player.send(
									`It's your turn! Here is your hand:\n\n**${hands[
										current_turn
									]
										.map((x) => x[side])
										.join(
											` **|** `
										)}**\n\nYou currently have ${
										hands[current_turn].length
									} cards.`
								);
							});
					} else {
						if (played_number == `Skip`) {
							turn_index++;
							turn_index %= players.length;
							game_message += `Sorry, ${
								usernames[turn_order[turn_index]]
							}, skip a turn!`;
						} else if (skip_everyone) {
							turn_index++;
							game_message += `Everyone else skips a turn!`;
							turn_index--;
						} else if (played_number.includes(`+`)) {
							turn_index++;
							turn_index %= players.length;
							const cards_to_draw = parseInt(played_number);
							for (let i = 0; i < cards_to_draw; i++) {
								const card_drawn = deck.pop();
								hands[turn_order[turn_index]].push(card_drawn);
								await players[turn_order[turn_index]].send(
									`You drew a **${card_drawn[side]}**!`
								);
							}
							game_message += `${
								usernames[turn_order[turn_index]]
							} drew ${cards_to_draw} cards! Also, skip a turn!`;
						} else if (played_number == `Flip`) {
							side = side ? 0 : 1;
							game_message += `Flip the deck!`;
							discard.reverse();
							game_message += ` The new card is **${
								discard[discard.length - 1][side]
							}**.`;
						} else if (played_number == `Reverse`) {
							if (players.length == 2) {
								turn_index++;
								turn_index %= players.length;
								game_message += ` Also, skip a turn!`;
							}

							const new_turn_order = structuredClone(turn_order);
							new_turn_order.reverse();
							while (
								turn_order[turn_index] !=
								new_turn_order[turn_index]
							) {
								new_turn_order.unshift(new_turn_order.pop());
							}
							turn_order = structuredClone(new_turn_order);
						}
						turn_index++;
						turn_index %= players.length;
						game_message += `\n\nIt's now ${
							usernames[turn_order[turn_index]]
						}'s turn!`;

						const play_embed = new EmbedBuilder()
							.setDescription(game_message)
							.setColor(
								color_map[
									discard[discard.length - 1][side].split(
										" "
									)[0]
								]
							);
						const play_message = await game_channel.send({
							embeds: [play_embed],
							components: [game_row],
						});

						current_turn = turn_order[turn_index];
						current_player = players[turn_order[turn_index]];
						move = "";
						await current_player.send(
							`It's your turn! Here is your hand:\n\n**${hands[
								current_turn
							]
								.map((x) => x[side])
								.join(` **|** `)}**\n\nYou currently have ${
								hands[current_turn].length
							} cards.`
						);
					}
				}
				hands.forEach((hand, index) => {
					if (hand.length == 0) {
						move_collector.stop();
						game_channel.send(`${players[index]} wins!`);
						stop_game();
					}
				});
			});
		}
		async function stop_game(reason = false) {
			current_uno_servers.splice(
				current_uno_servers.indexOf(interaction.guildId),
				1
			);
			if (reason) {
				interaction.channel.send(`Game closed due to ${reason}`);
			}
		}
		await interaction.reply(`Creating game...`);
		const signup_embed = (user_list) => {
			const embed = new EmbedBuilder()
				.setColor(0x6a019d)
				.setTitle(`Uno Flip game starting!`)
				.setDescription(`Click the button below to join.`)
				.addFields({
					name: `Players`,
					value: `${user_list.join(`\n`)}`,
				});
			return embed;
		};

		const join_button = new ButtonBuilder()
			.setCustomId("unoflip_join")
			.setLabel("Join")
			.setStyle(ButtonStyle.Success);
		const quit_button = new ButtonBuilder()
			.setCustomId("unoflip_quit")
			.setLabel("Quit")
			.setStyle(ButtonStyle.Danger);
		const start_button = (start) => {
			return new ButtonBuilder()
				.setCustomId("unoflip_start")
				.setLabel("Start")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(start);
		};
		const menu_button_row = new ActionRowBuilder().addComponents(
			join_button,
			quit_button,
			start_button(players.length > 1)
		);
		const signup_message = await interaction.channel.send({
			embeds: [signup_embed(usernames)],
			components: [menu_button_row],
		});

		const collector = signup_message.createMessageComponentCollector({
			filter: (i) => i.user.id !== interaction.client.user.id,
			time: 120000,
		});
		collector.on("collect", async (i) => {
			const { customId } = i;

			if (customId === "unoflip_join") {
				const user = i.user;
				if (players.includes(user)) {
					await i.reply({
						content: "You are already in the game!",
						ephemeral: true,
					});
				} else {
					players.push(user);
					usernames.push(user.username);
					await i.reply({
						content: "You have joined the game!",
						ephemeral: true,
					});
					await signup_message.edit({
						embeds: [signup_embed(usernames)],
						components: [menu_button_row],
					});
				}
			} else if (customId === "unoflip_quit") {
				const user = i.user;
				if (user.id == interaction.user.id) {
					await i.reply({
						content: "You can't quit the game, you're the host!",
						ephemeral: true,
					});
					return;
				}
				const index = players.findIndex(
					(player) => player.id === user.id
				);
				if (index !== -1) {
					players.splice(index, 1);
					usernames.splice(index, 1);
					await i.reply({
						content: "You have quit the game.",
						ephemeral: true,
					});
					await signup_message.edit({
						embeds: [signup_embed(usernames)],
						components: [menu_button_row],
					});
				}
			} else if (customId === "unoflip_start") {
				const user = i.user;
				if (players.length > 1 && players[0].id === user.id) {
					await i.reply({
						content: "Starting the game...",
						ephemeral: true,
					});
					collector.stop(`Started`);
				} else if (players[0].id !== user.id) {
					await i.reply({
						content: "You are not the host!",
						ephemeral: true,
					});
				} else if (players.length <= 1) {
					await i.reply({
						content: "There aren't enough players yet!",
						ephemeral: true,
					});
				}
			}
		});

		collector.on("end", (collected, reason) => {
			if (players.length > 1) {
				signup_message.edit({
					content: `Game started!`,
					embeds: [signup_embed(usernames)],
					components: [],
				});
				start_game();
			} else {
				signup_message.edit({
					content: `Game closed due to inactivity.`,
					embeds: [signup_embed(usernames)],
					components: [],
				});
				stop_game(`inactivity`);
			}
		});
	},
};
