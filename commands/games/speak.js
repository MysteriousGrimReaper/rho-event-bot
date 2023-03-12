const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("speak")
        .setDescription("speak!!!!!")
        .addStringOption(
            option => option.setName('message')
            .setDescription('Write your message here!'))
        .addChannelOption(
            option => option.setName('channel')
            .setDescription('Which channel to send the message in.'))
        .addUserOption(
            option => option.setName('user')
            .setDescription('Who to send the message to.')),
    async execute(interaction) {
        interaction.reply({ ephemeral: true, content: 'hi' })
        if (interaction.options.getChannel('channel')) {
            interaction.options.getChannel('channel').send(`${interaction.options.getString('message')}`)
            console.log(`${interaction.options.getString('message')}`)
        }
        else if (interaction.options.getUser('user')) {
            interaction.options.getUser('user').send(`${interaction.options.getString('message')}`)
        }
        else {
            interaction.client.channels.cache.get("1054960598145839104").send(`${interaction.options.getString('message')}`)
        }
        
        
    },
}