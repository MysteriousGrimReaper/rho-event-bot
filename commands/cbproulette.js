const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { clearInterval } = require('timers');
const array = fs.readFileSync('dict.txt').toString().split("\n");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cbpr")
        .setDescription("Begin 1 round of Bomb Party Roulette! For event hosts only.")
        .addUserOption(option => option.setName('fuse')
            .setDescription('Who should start with the bomb?')
            .setRequired(true)),
    async execute(interaction) {
        const game_channel = interaction.channel
        let bomb = interaction.options.getUser('fuse')
        let chance_to_explode = 0
        const max_sec = 25
        const min_sec = 5
        const mwpp = 50
        const Mwpp = 1000
        let i_time = Date.now()
        const bomb_history = []

        function makeid(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        function valid_substring(substring) {
            const list = array.filter(obj => {
                if (obj.includes(substring)) {
                    return true
                }
                return false
            })
            return list.length >= mwpp && list.length <= Mwpp
        }
        let sub;
        while (!valid_substring(sub)) {
            sub = makeid(3)
        }
        await interaction.reply(`Bombparty Roulette round started!`);
        await game_channel.send(`<@${bomb.id}>\n**${sub}**`)
        let interval = setInterval(function() {
            if (Date.now() - i_time > min_sec * 1000) {
                chance_to_explode++
                if (Math.random() < chance_to_explode / (1000 * (max_sec - min_sec))) {
                    chance_to_explode = 0
                    const person = game_channel.guild.members.cache.get(bomb.id);
                    if (person.roles.cache.some(role => role.name === 'Immunity')) {
                        person.roles.remove("1041467237250383932")
                        game_channel.send(`🛡️ <@${bomb.id}>'s shield blocked the blast!`)
                    } else {
                        game_channel.send(`💥 The bomb exploded on <@${bomb.id}>! Better luck next time...`)
                    }
                    game.stop()
                }
            }
        }, 100);
        const filter = check => array.includes(check.content.toUpperCase().replaceAll(/[^A-Z]/gi, '') + "\r") && check.author.id != "1041070495119966358"
            // filter
        const game = game_channel.createMessageCollector({ filter })

        game.on('collect', async(m) => {
            if (m.author.id === bomb.id) {
                if (m.content.toUpperCase().includes(sub)) {
                    bomb_history.push(bomb.id)
                    chance_to_explode = 0
                    clearInterval(interval)
                    m.react('✅')
                    await game_channel.send('Ping someone to throw the bomb at!')

                } else {
                    m.react('❌')
                }
            }
        })
        game.on('ignore', async(m) => {
            if (m.content == "fs" && m.author.id == interaction.user.id) {
                game.stop()
            } else if (m.mentions.members.first() && m.author.id == bomb.id && m.mentions.members.first().id != `1041070495119966358`) {
                bomb = m.mentions.members.first()
                sub = '.'
                while (!valid_substring(sub)) {
                    sub = makeid(3)
                }
                let count = 0;
                bomb_history.forEach(element => {
                    if (element === bomb.id) {
                        count += 1
                    }
                })
                game_channel.send(`<@${bomb.id}>\n**${sub}**`)
                i_time = Date.now()
                interval = setInterval(function() {
                    if (Date.now() - i_time > min_sec * 1000) {
                        chance_to_explode++
                        if (Math.random() < chance_to_explode / (1000 * (max_sec - min_sec))) {
                            chance_to_explode = 0
                            const person = game_channel.guild.members.cache.get(bomb.id);
                            if (person.roles.cache.some(role => role.name === 'Immunity')) {
                                person.roles.remove("1041467237250383932")
                                game_channel.send(`🛡️ <@${bomb.id}>'s shield blocked the blast!`)
                            } else {
                                game_channel.send(`💥 The bomb exploded on <@${bomb.id}>! Better luck next time...`)
                            }
                            game.stop()
                        }
                    }
                }, 100 / Math.max(1, count));
            } else if (m.author.id == bomb.id) {
                m.react('❌')
            }
        })

        game.on('end', async() => {
            clearInterval(interval)
        })

        /*
        const filter
        const col = game_channel.createMessageCollector({})
        col.on('collect', async(m) => {
            const person = game_channel.guild.members.cache.get(m.author.id);
            person.roles.add("600137520306716707")
        })
        col.on('end', async() => {
            await game_channel.permissionOverwrites.create(game_channel.guild.roles.everyone, { SendMessages: false });
            await interaction.channel.send("game_channel are now closed.");
        })*/

    },
}