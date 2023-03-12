const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { clearInterval } = require('node:timers');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const twow_responses = db.table(`twow_responses`)
const twow_votes = db.table(`twow_votes`)

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sstwow")
        .setDescription("Begin supersonic TWOW! For event hosts only.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const game_channel = interaction.channel
        await interaction.reply(`Starting game of Supersonic 2COW!`)
        const prompts = [
            ``
        ]
        const players = [interaction.user]
        const tags = [interaction.user.tag]
        const collectors = []
        function updateEmbed ({ start = false } = {}) {
            return new EmbedBuilder()
            .setTitle(start ? `Game started!` : `Supersonic 2COW game starting! React to this message to join. (Make sure you have DM permissions enabled)`)
            .setDescription(tags.join(`\n`))
        }
        let init_embed = updateEmbed()
        await interaction.reply(`Starting game...`)
        const init_message = await interaction.channel.send({ embeds: [init_embed] })
        init_message.react(`☑️`)
        let filter = (reaction, user) => {
            return user.id != interaction.user.id && user.id != interaction.client.user.id;
        };
        const signup = init_message.createReactionCollector({ filter, time: 60000 })
        signup.on('collect', async (reaction, user) => {
            if (reaction.emoji == '✅' && user.id == `315495597874610178`) {
                signup.stop()
            }
            else if (!tags.includes(user.tag)) {
                players.push(user)
                tags.push(user.tag)
                init_embed = updateEmbed()
                await init_message.edit({ embeds: [init_embed] })
            }
            
        })
        let round = 0
        signup.on(`end`, async () => {
            interaction.channel.send(`<@600137520306716707> New round! You have 60 seconds to respond to the prompt: ${prompts[round]}`)
            .then(() => new Promise((resolve) => {
                filter = m => m.content.length <= 2
            for (const i of players) {
                collectors.push(i.createMessageCollector({ filter, time: 63000 }))
            }
            for (const i of collectors) {
                i.on(`collect`, (m) => {
                    m.reply(`Your response has been recorded as ${m.content}.`)
                    twow_responses.set(`${m.author.tag}`, `${m.content}`)
                })
                i.on(`ignore`, (m) => {
                    m.reply(`Your response was too long!`)
                })
                i.on(`end`, () => {
                    resolve(true)
                })
            }
            }))
            .then(() => new Promise((resolve) => {
                filter = () => true
            for (const i of players) {
                collectors.push(i.createMessageCollector({ filter, time: 63000 }))
            }
            for (const i of collectors) {
                i.on(`collect`, (m) => {
                    m.reply(`Your response has been recorded as ${m.content}.`)
                    twow_responses.set(`${m.author.tag}`, `${m.content}`)
                })
                i.on(`ignore`, (m) => {
                    m.reply(`Your response was too long!`)
                })
                i.on(`end`, () => {
                    resolve(true)
                })
            }
            }))
            
            
        })

    },
}