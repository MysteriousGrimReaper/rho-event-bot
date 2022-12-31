const { EmbedBuilder } = require('discord.js');
module.exports = function (interaction, game) {
    const players = [interaction.user]
        const tags = [interaction.user.tag]
        function updateEmbed ({ start = false } = {}) {
            return new EmbedBuilder()
            .setTitle(start ? `Game started!` : `Five Alive game starting! React to this message to join. ${interaction.user.username}, react to the message when you are ready to begin! \n(Make sure you have DM permissions enabled)`)
            .setDescription(tags.join(`\n`))
        }
        let init_embed = updateEmbed()
        interaction.reply(`Starting game...`)
        const init_message = interaction.channel.send({ embeds: [init_embed] })
        init_message.react(`☑️`)
        const filter = (reaction, user) => {
            return user.id != interaction.client.user.id;
        };
        const signup = init_message.createReactionCollector({ filter })
        signup.on('collect', async (reaction, user) => {
            if (user.id == interaction.user.id) {
                signup.stop()
            }
            else if (!tags.includes(user.tag)) {
                players.push(user)
                tags.push(user.tag)
                init_embed = updateEmbed()
                await init_message.edit({ embeds: [init_embed] })
            }
            
        })
        signup.on('end', async () => game())
}