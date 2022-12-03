const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("2cowfl")
        .setDescription("Exports the responses, hosts only.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        await interaction.reply({ ephemeral: true, content: `Responses deleted.` })
        await db.deleteAll()
    },
}