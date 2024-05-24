/* eslint-disable comma-dangle */
/* eslint-disable no-inner-declarations */
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const DISCORD_EPOCH = 1420070400000;
module.exports = {
	data: new SlashCommandBuilder()
		.setName("timestamptest")
		.setDescription("Test command"),

	async execute(interaction) {
		const snowflake = interaction.id;
		const time = (BigInt(snowflake) >> 22n) + 1420070400000n;
		await interaction.reply(`<t:${Number(time)}> (${time})`);
		console.log(interaction.id);
		console.log(new Date(Number(time)));
	},
};
