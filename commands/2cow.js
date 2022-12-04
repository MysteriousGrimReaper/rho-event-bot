const { SlashCommandBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("2cow")
        .setDescription("Respond to the 2cow round.")
        .addStringOption(
            option => option.setName('response')
            .setDescription('Write your response here!')),
    async execute(interaction) {
        const test_channel = interaction.client.channels.cache.get("1041097062407745546")
        await db.set(interaction.user.tag, interaction.options.getString('response'))
        await interaction.reply({ ephemeral: true, content: `Response recorded as \`${interaction.options.getString('response')}\`. Your character count is \`${interaction.options.getString('response').length}\`.` })
        test_channel.send(`${interaction.user.tag} Response recorded as \`${interaction.options.getString('response')}\`. Your character count is \`${interaction.options.getString('response').length}\`.`)
    },
}