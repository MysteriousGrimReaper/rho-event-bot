/* eslint-disable comma-dangle */
/* eslint-disable no-inner-declarations */
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const path = require("path");
const fs = require(`fs`);
const { dir } = require("../dir.json");
const wait = require("node:timers/promises").setTimeout;
const dPath_game = path.join(dir, "game-lists/");
const full_prompt_list = fs
	.readFileSync(path.join(dPath_game, "chameleon.txt"))
	.toString()
	.split("\n");
module.exports = {
	data: new SlashCommandBuilder()
		.setName("chameleon")
		.setDescription("Copyright Infringement Game")
		.addSubcommand((subcommand) =>
			subcommand
				.setName(`classic`)
				.setDescription(
					`Chameleon receives the line "You are a chameleon."`
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(`switch`)
				.setDescription(
					`Chameleon receives a different item of the same category.`
				)
		),

	async execute(interaction) {
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
		shuffle(full_prompt_list);
		const players = [interaction.user];
		const tags = [interaction.user.tag];
		function updateEmbed({ start = false } = {}) {
			return new EmbedBuilder()
				.setTitle(
					start
						? `Game started!`
						: `Chameleon game starting! React to this message to join. ${interaction.user.username}, react to the message when you are ready to begin! \n(Make sure you have DM permissions enabled)`
				)
				.setDescription(tags.join(`\n`));
		}
		let init_embed = updateEmbed();
		await interaction.reply(`Starting game...`);
		const init_message = await interaction.channel.send({
			embeds: [init_embed],
		});
		init_message.react(`☑️`);
		let filter = (reaction, user) => {
			return user.id != interaction.client.user.id;
		};
		const signup = init_message.createReactionCollector({ filter });
		signup.on("collect", async (reaction, user) => {
			if (user.id == interaction.user.id) {
				signup.stop();
			} else if (!tags.includes(user.tag)) {
				players.push(user);
				tags.push(user.tag);
				init_embed = updateEmbed();
				await init_message.edit({ embeds: [init_embed] });
			}
		});
		signup.on(`end`, async () => {
			const minutes = 3;
			const valid_items = [
				`Pizza`,
				`Potatoes`,
				`Fish`,
				`Cake`,
				`Pasta`,
				`Salad`,
				`Soup`,
				`Bread`,
				`Eggs`,
				`Cheese`,
				`Fruit`,
				`Sausage`,
				`Chicken`,
				`Ice Cream`,
				`Chocolate`,
				`Beef`,
			];
			const item =
				valid_items[Math.floor(Math.random() * valid_items.length)];

			shuffle(players);
			const chameleonID = players[0].id;

			await players.forEach((player) =>
				player.send(
					`${
						chameleonID == player.id
							? `You are the chameleon.`
							: `The item is: ${item}`
					}\nThe possible items are:\n${valid_items.join(", ")}`
				)
			);
			await shuffle(players);
			await interaction.channel.send(
				`${players.join(
					` `
				)}\n Say a word/phrase pertaining to the item were just DM'd. You have ${minutes} minutes to discuss.`
			);
			await wait(60 * minutes * 1000);
			await interaction.channel.send(
				`${players.join(
					` `
				)}\nYou have 15 seconds to ping the player to vote them as the chameleon!`
			);
			const userIDs = players.map((user) => user.id);
			filter = (msg) => {
				if (
					msg.mentions.users.size === 0 ||
					!userIDs.includes(msg.author.id)
				) {
					return false;
				}
				const mentionedUserIDs = msg.mentions.users.map(
					(user) => user.id
				);
				return mentionedUserIDs.some((id) => userIDs.includes(id));
			};
			const vote_collector = interaction.channel.createMessageCollector({
				filter,
				time: 15000,
			});
			let votes = [];
			vote_collector.on("collect", (msg) => {
				const mentionedUsers = msg.mentions.users;
				const firstMentionedUser = mentionedUsers.first();
				votes.push([msg.author.id, firstMentionedUser.id]);
				interaction.channel.send(
					`Vote confirmed for **${firstMentionedUser.username}**.`
				);
			});
			vote_collector.on("end", async () => {
				if (votes.length == 0) {
					interaction.channel.send(
						`The chameleon escaped! <@${chameleonID}> wins!`
					);
					return;
				}
				votes = votes.reduce((acc, curr) => {
					const existing = acc.find((el) => el[0] === curr[0]);

					if (existing) {
						existing[1] = curr[1];
					} else {
						acc.push(curr);
					}

					return acc;
				}, []);
				const freqMap = votes.reduce((acc, curr) => {
					const count = acc[curr[1]] || 0;
					acc[curr[1]] = count + 1;
					return acc;
				}, {});
				const mostCommon = Object.keys(freqMap).reduce((a, b) =>
					freqMap[a] > freqMap[b] ? a : b
				);
				await interaction.channel.send(
					`<@${mostCommon}> received the most votes...`
				);
				await wait(2500);
				await interaction.channel.send(`**They were...**`);
				await wait(2500);
				await interaction.channel
					.send(
						`**${
							mostCommon == chameleonID ? `` : `NOT `
						}the chameleon.**`
					)
					.then(async () => {
						if (mostCommon == chameleonID) {
							await wait(1000);
							await interaction.channel.send(
								`<@${chameleonID}>, what do you think the item was? (You have 15 seconds to respond)`
							);
							filter = (msg) =>
								msg.author.id == chameleonID &&
								valid_items
									.map((i) => i.toLowerCase())
									.includes(msg.content.toLowerCase());
							const chameleon_guess =
								await interaction.channel.createMessageCollector(
									{
										filter,
										time: 15000,
										max: 1,
									}
								);
							chameleon_guess.on(`collect`, (msg) => {
								interaction.channel.send(
									`${
										msg.content.toLowerCase() ==
										item.toLowerCase()
											? `The chameleon is correct! <@${chameleonID}> wins!`
											: `The chameleon is incorrect! Everyone else wins!`
									}`
								);
							});
							chameleon_guess.on(`ignore`, (msg) => {
								msg.react(`❌`);
							});
						} else {
							interaction.channel.send(
								`The chameleon escaped! <@${chameleonID}> wins!`
							);
						}
					});
			});
		});
	},
};
