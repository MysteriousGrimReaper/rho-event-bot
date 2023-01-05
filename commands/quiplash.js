/* eslint-disable no-inner-declarations */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const randomColor = require('randomcolor');
const fs = require(`fs`)
const full_prompt_list = fs.readFileSync('quiplash.txt').toString().split("\n");


module.exports = 
{
    data: new SlashCommandBuilder()
        .setName('quiplash')
        .setDescription('Copyright Infringement Game'),

    async execute(interaction) 
    {
        const time_limit = 120
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
                    array[randomIndex], array[currentIndex],
                ];
            }

            return array;
        }
        shuffle(full_prompt_list)
        const players = [interaction.user]
        const tags = [interaction.user.tag]
        function updateEmbed ({ start = false } = {}) {
            return new EmbedBuilder()
            .setTitle(start ? `Game started!` : `Quiplash game starting! React to this message to join. ${interaction.user.username}, react to the message when you are ready to begin! \n(Make sure you have DM permissions enabled)`)
            .setDescription(tags.join(`\n`))
        }
        let init_embed = updateEmbed()
        await interaction.reply(`Starting game...`)
        const init_message = await interaction.channel.send({ embeds: [init_embed] })
        init_message.react(`☑️`)
        let filter = (reaction, user) => {
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

        signup.on(`end`, async () => {
            if (players.length < 3) {
                interaction.channel.send(`There weren't enough players to start...`)
            }
            else {
                init_embed = updateEmbed({ start: true })
                await init_message.edit({ embeds: [init_embed] })
                const prompts = []
                let round = 1
                const anyplayer = players[Math.floor(Math.random() * players.length)].username
                quiplash_respond({ start: true })
                async function quiplash_vote () {
                    const prompt_indices = Array.from(Array(players.length).keys())
                    shuffle(prompt_indices)
                    let prompt_index_a = 0
                    let prompt_index = prompt_indices[prompt_index_a]
                    interaction.channel.send(`${players.join(``)}\nEveryone has sent their responses in!`)
                    async function vote_start (index) {
                        const q_prompt = prompts[index]
                        const player1 = players.filter(x => x.prompt_a == q_prompt)[0]
                        const response1 = player1.response_a
                        const player2 = players.filter(x => x.prompt_b == q_prompt)[0]
                        const response2 = player2.response_b
                        const vote_message = await interaction.channel.send(`**${q_prompt.replace(`<ANYPLAYER>`, anyplayer)}**\n:a: ${response1}\n:b: ${response2}`)
                        vote_message.react('🅰️').then(() => vote_message.react(`🅱️`))
                        filter = (reaction, user) => {
                            return ['🅰️', '🅱️'].includes(reaction.emoji.name) && user.id != interaction.client.user.id && ![player1.id, player2.id].includes(user.id);
                        };
                        vote_message.awaitReactions({ filter, time: 20000, errors: ['time'] })
                        .catch(async (collected) => {
                            const nanzero = (num) => Number.isNaN(num) ? 0 : num
                            const a_votes = collected.get('🅰️') ? collected.get('🅰️').count - 1 : 0
                            const b_votes = collected.get('🅱️') ? collected.get('🅱️').count - 1 : 0
                            await interaction.channel.send(`${player1} got **${a_votes}** votes. (+${nanzero(Math.round(10000 * round * a_votes / (a_votes + b_votes)))})\n${player2} got **${b_votes}** votes. (+${nanzero(Math.round(10000 * round * b_votes / (a_votes + b_votes)))})`)
                            .then(() => {
                                player1.score += nanzero(Math.round(10000 * round * a_votes / (a_votes + b_votes)))
                                player2.score += nanzero(Math.round(10000 * round * b_votes / (a_votes + b_votes)))
                                prompt_index_a++
                            })
                            .then(() => {
                                if (prompt_index_a < players.length) {
                                    prompt_index = prompt_indices[prompt_index_a]
                                    vote_start(prompt_index)
                                }
                                else {
                                    round++
                                    if (round <= 3) {
                                        quiplash_respond()
                                    }
                                    else {
                                        const scoreboard = new EmbedBuilder()
                        .setColor(randomColor())
                        .setTitle('Final Scores')
                        .setThumbnail(`${players.sort((a, b) => b.score - a.score)[0].displayAvatarURL()}`)
                        .setDescription(`:crown: ${players.sort((a, b) => b.score - a.score).map(x => `${x} - ${x.score}`).join('\n')}`)
                        interaction.channel.send({ embeds: [scoreboard] })
                                        
                                    }
                                }
                            })
                        });
                    }
                    vote_start(prompt_index)
                }
                async function quiplash_respond({ start = false } = {}) {
                    
                    while (prompts.length > 0) {
                        prompts.pop()
                    }
                    while (prompts.length < players.length) {
                        prompts.push(full_prompt_list.pop())
                    }
                    let responders = 0
                    if (!start) {
                        const scoreboard = new EmbedBuilder()
                        .setColor(randomColor())
                        .setTitle('Scores')
                        .setThumbnail(`${players.sort((a, b) => b.score - a.score)[0].displayAvatarURL()}`)
                        .setDescription(`${players.sort((a, b) => b.score - a.score).map(x => `${x} - ${x.score}`).join('\n')}`)
                        interaction.channel.send({ embeds: [scoreboard] })
                    }
                    for (const i of players) {
                        const reminder = setInterval(async function() {
                            i.send(`Make sure to submit your response soon! (This reminder is sent every 30 seconds.)`)
                        }, 30000)
                        if (start) {
                            i.score = 0
                        }
                        i.prompt_a = prompts[players.indexOf(i)]
                        i.response_a = `[No answer]`
                        i.prompt_b = prompts[(players.indexOf(i) + 1) % prompts.length]
                        i.response_b = `[No answer]`
                        i.send(`Respond to the following prompt: \`${prompts[players.indexOf(i)].replace(`<ANYPLAYER>`, anyplayer)}\``)
                        .then(() => new Promise((resolve, reject) => {
                            const bot_filter = (m) => !m.author.bot && m.content.length <= 500
                            i.dmChannel.awaitMessages({ filter: bot_filter, time: (time_limit + 3) * 1000, max: 1 })
                            .then(m => {
                                i.response_a = m.first().content
                            i.send(`Your answer has been recorded as \`${m.first().content}\`.`)
                                resolve(true)
                            })
                            .catch(() => {
                                reject(true)
                            });
                        }))
                        .then(() => new Promise((resolve) => {
                            resolve(i.send(`Respond to the following prompt: \`${prompts[(players.indexOf(i) + 1) % prompts.length].replace(`<ANYPLAYER>`, anyplayer)}\``))
                        }))
                        .then(async () => new Promise((resolve, reject) => {
                            const bot_filter = (m) => !m.author.bot && m.content.length <= 500
                            i.dmChannel.awaitMessages({ filter: bot_filter, time: (time_limit + 3) * 1000, max: 1 })
                            .then(async (m) => {
                                i.response_b = m.first().content
                            await i.send(`Your answer has been recorded as \`${m.first().content}\`.`)
                            responders++
                            await interaction.channel.send(`${i} has finished!`)
                            if (responders == players.length) {
                                await quiplash_vote()
                            }
                                resolve(true)
                                clearInterval(reminder)
                            })
                            .catch(() => {
                                reject(true)
                            });
                        }))
                        .catch(async () => {i.send(`Uh oh, you didn't respond on time!`)
                        clearInterval(reminder)
                        responders++
                            await interaction.channel.send(`${i} has finished!`)
                            if (responders == players.length) {
                                await quiplash_vote()
                            }
                    })
                    }
                }
        }
        })
    },
};