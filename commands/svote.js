const { SlashCommandBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ssvote")
        .setDescription("Vote someone in the speed circle.")
        .addUserOption(
            option => option.setName('vote')
            .setDescription('Who are you voting?')),
    async execute(interaction) {
        if (interaction.guild.members.cache.get(interaction.user.id).roles.cache.has("600137520306716707") && interaction.guild.members.cache.get(interaction.options.getUser('vote').id).roles.cache.has("600137520306716707")) {
            await db.set(interaction.user.tag, interaction.options.getUser('vote'))
            await interaction.reply({ ephemeral: true, content: `You have voted for **${interaction.options.getUser('vote').tag}**.` })
        }
        else {
            await interaction.reply({ ephemeral: true, content: `You can't vote **${interaction.options.getUser('vote').tag}**!` })
        }
        
    },
}