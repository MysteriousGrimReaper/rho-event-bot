/* eslint-disable comma-dangle */
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { clearInterval } = require("timers");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("hotpotato")
		.setDescription("Begin 1 round of Hot Potato! For event hosts only.")
		.addUserOption((option) =>
			option
				.setName("fuse")
				.setDescription("Who should start with the hot potato?")
				.setRequired(true)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
		const game_channel =
			interaction.client.channels.cache.get("814967728226041906");
		let bomb = interaction.options.getUser("fuse");
		let chance_to_explode = 0;
		const max_sec = 10;
		const min_sec = 3;
		let i_time = Date.now();

		await interaction.reply(`Hot Potato round started!`);
		await game_channel.send(
			`<@${bomb.id}>\nQuick, ping someone to throw the hot potato at!`
		);
		const interval = setInterval(function () {
			if (Date.now() - i_time > min_sec * 1000) {
				chance_to_explode++;
				if (
					Math.random() <
					chance_to_explode / (1000 * (max_sec - min_sec))
				) {
					chance_to_explode = 0;
					const person = game_channel.guild.members.cache.get(
						bomb.id
					);
					if (
						person.roles.cache.some(
							(role) => role.name === "Immunity"
						)
					) {
						person.roles.remove("1041467237250383932");
						game_channel.send(
							`🛡️ <@${bomb.id}>'s shield blocked the blast!`
						);
					} else {
						game_channel.send(
							`💥 The hot potato exploded on <@${bomb.id}>! Better luck next time...`
						);
					}
					game.stop();
				}
			}
		}, 100);
		// filter
		const filter = (m) => !m.author.bot;
		const game = game_channel.createMessageCollector({
			filter,
			time: 600000,
		});

		/* function check_letter(message, letter) {
            return message.replace(letter, '').length < message.length
        }*/
		game.on("collect", async (m) => {
			if (m.content == "fs" && m.author.id == interaction.user.id) {
				game.stop();
			} else if (m.mentions.members.first() && m.author.id == bomb.id) {
				if (
					m.mentions.members
						.first()
						.roles.cache.some(
							(role) => role.name === "Event Contenders!"
						) &&
					m.mentions.members.first().id != bomb.id
				) {
					bomb = m.mentions.members.first();
					game_channel.send(
						`<@${bomb.id}>\nQuick, ping someone to throw the hot potato at!`
					);
					i_time = Date.now();
				} else if (m.mentions.members.first().id == bomb.id) {
					game_channel.send(
						`You can't throw the hot potato at yourself, it'll explode!`
					);
				} else {
					game_channel.send("That user is not playing!");
				}
			} else if (m.author.id == bomb.id) {
				m.react("❌");
			} else if (m.mentions.members.first() && m.author.id != bomb.id) {
				clearInterval(interval);
				game_channel.send(
					`💥 The hot potato exploded on <@${m.author.id}>! Better luck next time...`
				);
				game.stop();
			}
		});

		game.on("end", async () => {
			clearInterval(interval);
		});
	},
};
