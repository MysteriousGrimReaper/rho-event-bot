/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-case-declarations */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const signups = require(`../signup.js`)
module.exports = {
    data: new SlashCommandBuilder()
        .setName('onw')
        .setDescription('Starts a game of one night werewolf.'),
    async execute(interaction) {
        const game_channel = interaction.client.channels.cache.get("814967728226041906")
        function getOccurrence(array, value) {
            let count = 0;
            array.forEach((v) => (v === value && count++));
            return count;
        }
        const mode = a => {
            a = a.slice().sort((x, y) => x - y);
          
            let bestStreak = 1;
            let bestElem = a[0];
            let currentStreak = 1;
            let currentElem = a[0];
          
            for (let i = 1; i < a.length; i++) {
              if (a[i - 1] !== a[i]) {
                if (currentStreak > bestStreak) {
                  bestStreak = currentStreak;
                  bestElem = currentElem;
                }
          
                currentStreak = 0;
                currentElem = a[i];
              }
          
              currentStreak++;
            }
          
            return currentStreak > bestStreak ? currentElem : bestElem;
          };
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
        const players = [interaction.user]
        const tags = [interaction.user.tag]
        function updateEmbed ({ start = false } = {}) {
            return new EmbedBuilder()
            .setTitle(start ? `Game started!` : `One Night Werewolf game starting! React to this message to join. ${interaction.user.username}, react to the message when you are ready to begin! \n(Make sure you have DM permissions enabled)`)
            .setDescription(tags.join(`\n`))
        }
        let init_embed = updateEmbed()
        await interaction.reply(`Starting game...`)
        const init_message = await interaction.channel.send({ embeds: [init_embed] })
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
        signup.on('end', async () => {
            if (players.length >= 3) {
                init_embed = updateEmbed({ start: true })
                await init_message.edit({ embeds: [init_embed] })
                const roles = ['Villager', 'Werewolf', 'Werewolf', 'Seer', 'Robber', 'Troublemaker']
                const ext_roles = ['Villager', 'Villager', 'Tanner', 'Drunk', 'Hunter', 'Insomniac', 'Minion']
                shuffle(ext_roles)
                while (roles.length < (players.length + 3)) {
                    if (ext_roles.length > 0) {
                        roles.push(ext_roles.pop())
                    }
                    else {
                        roles.push(`Villager`)
                    }
                }
                await interaction.channel.send(`Role list: \n` + roles.join(`\n`))
                shuffle(roles)
                const new_roles = roles
                const middle_roles = roles.slice(players.length, players.length + 3)
                
                for (const i in players) {
                    await interaction.client.users.send(players[i].id, `Your role is **${roles[i]}**.`)
                }
                let r_role = Math.floor(Math.random() * 3)
                const r_role3 = Math.floor(Math.random() * 3)
                const r_time = 5000 * Math.random() + 8000

                new Promise((resolve) => {
                    if (players[roles.indexOf('Werewolf')] != undefined) {
                    resolve(players[roles.indexOf('Werewolf')].send(getOccurrence(roles.slice(0, players.length), 'Werewolf') == 1 ? `One of the middle roles is **${middle_roles[r_role]}**.` : `List of werewolves: ${tags.filter(x => roles[tags.indexOf(x)] == 'Werewolf')}`)) 
                    }
                    else {
                        resolve(true)
                    }
                })
                // werewolf 2
                .then(() => 
                new Promise((resolve) => {
                    console.log(`werewolf 2`)
                    if (players[roles.indexOf('Werewolf', roles.indexOf('Werewolf') + 1)] != undefined) {
                    resolve((players[roles.indexOf('Werewolf', roles.indexOf('Werewolf') + 1)]).send(`List of werewolves: ${tags.filter(x => roles[tags.indexOf(x)] == 'Werewolf')}`))
                    }
                    else {
                        resolve(true)
                    }
                }),
                ) 
                // minion
                .then(() => 
                new Promise((resolve) => {
                    console.log(`minion`)
                    if ((players[roles.indexOf('Minion')]) != undefined) {
                    resolve((players[roles.indexOf('Minion')]).send(`List of werewolves: ${tags.filter(x => roles[tags.indexOf(x)] == 'Werewolf')}`))
                    }
                    else {
                        resolve(true)
                    }
                }),
                )
                // seer
                .then(() => 
                    new Promise((resolve) => {
                        console.log(`seer`)
                        r_role = Math.floor(Math.random() * 3)
                            if (players[roles.indexOf('Seer')] != undefined) {
                                players[roles.indexOf('Seer')].send(`You may look at another player's cards or two of the center cards. (type 'center' to see the center cards) (Copy and paste someone from the player list to see their role) \nPlayer list: \n${tags.join(`\n`)}`)
                                const seer_filter = m => (tags.includes(m.content) || m.content == 'center') && m.author.tag != m.content
                                players[roles.indexOf('Seer')].dmChannel.awaitMessages({ filter: seer_filter, max: 1, time: 30000, errors: ['time'] })
                               .then(m => {
                                    players[roles.indexOf('Seer')].send(m.first().content == 'center' ? `2 of the center roles are: **${middle_roles[r_role]}, ${middle_roles[(r_role + 1) % 3]}**` : `${m.first().content}'s role is **${roles[tags.indexOf(m.first().content)]}**`)
                                    resolve(true)
                                })
                                .catch(() => {
                                    players[roles.indexOf('Seer')].send(`2 of the center roles are: **${middle_roles[r_role]}, ${middle_roles[(r_role + 1) % 3]}**`)
                                    resolve(true)
                                });
                            }
                            else {
                                setTimeout(() => {
                                    resolve(true)
                                }, r_time)
                            }
                }))
                // robber
                .then(() => new Promise((resolve) => {
                    console.log(`robber`)
                    if (players[roles.indexOf('Robber')] != undefined) {
                        const player = players[roles.indexOf('Robber')]
                    player.send(`You may exchange your card with another player's card, and then view your new card. (Copy and paste someone from the player list to steal their role) \nPlayer list: \n${tags.join(`\n`)}`)
                    const robber_filter = m => tags.includes(m.content)
                    const robber_col = (players[roles.indexOf('Robber')]).dmChannel.createMessageCollector({ filter: robber_filter, max: 1, time: 63000 })
                    robber_col.on('collect', async (m) => {
                        player.send(`Your new role is **${roles[tags.indexOf(m.content)]}**`)
                        [new_roles[tags.indexOf(m.content)], new_roles[roles.indexOf('Robber')]] = [new_roles[roles.indexOf('Robber')], new_roles[tags.indexOf(m.content)]] 
                    })
                    robber_col.on('ignore', async (m) => console.log(m.content))
                    robber_col.on('end', async () => resolve(true))
                    }
                    else {
                        setTimeout(() => {
                            resolve(true)
                        }, r_time)
                    }
                }))
                // troublemaker
                .then(() => new Promise((resolve) => {
                    console.log(`troublemaker`)
                    if (players[roles.indexOf('Troublemaker')] != undefined) {
                        const player = players[roles.indexOf('Troublemaker')]
                    const swap = []
                    for (const i in players) {
                        if (i != roles.indexOf('Troublemaker')) {
                            swap.push(players[i])
                        }
                    }
                    shuffle(swap)
                    while (swap.length > 2) {
                        swap.pop()
                    }
                    [new_roles[players.indexOf(swap[0])], new_roles[players.indexOf(swap[1])]] = [new_roles[players.indexOf(swap[1])], new_roles[players.indexOf(swap[0])]] 
                    player.send(`${swap[0]} and ${swap[1]} have swapped roles.`)
                    resolve(true)
                    }
                    else {
                        setTimeout(() => {
                            resolve(true)
                        }, r_time)
                    }
                }))
                // drunk
                .then(() => new Promise((resolve) => {
                    console.log(`drunk`)
                    if (players[roles.indexOf('Drunk')] != undefined) {
                    [new_roles[r_role3 + roles.indexOf('Drunk')], new_roles[roles.indexOf('Drunk')]] = [new_roles[roles.indexOf('Drunk')], new_roles[r_role3 + roles.indexOf('Drunk')]]
                    }
                    resolve(true)
                }))
                // insomniac
                .then(() => new Promise((resolve) => {
                    console.log(`insomniac`)
                    if (players[roles.indexOf('Insomniac')] != undefined) {
                        players[roles.indexOf(`Insomniac`)].send(`Your role is ${new_roles[roles.indexOf(`Insomniac`)]}`)
                    }
                    resolve(true)
                }))
                // discuss phase
                .then(() => new Promise((resolve) => {
                    console.log(`end`)
                    const ids = players.map(x => `<@` + x.id + `>`)
                    interaction.channel.send(`${ids.join('')}\nTime to wake up! You have **5 minutes** to discuss.`)
                    const ff_filter = m => m.content == 'ff' && m.author.id == `315495597874610178`
                    const ff = game_channel.createMessageCollector({ filter: ff_filter, time: 300000 })
                    ff.on('collect', () => ff.stop())
                    ff.on('end', () => resolve(true)) // reset this back to 300000
                }))
                // vote phase
                .then(() => new Promise((resolve) => {
                    console.log(`vote`)
                    const vote_list = []
                    const voters = []
                    const ids = players.map(x => `<@` + x.id + `>`)
                        interaction.channel.send(`${ids.join('')}\nTime to vote! You have 30 seconds to ping the person you would like to vote. (Type center to vote the center)`)
                        const vote_filter = (m) => (m.mentions.members.first() || m.content == 'center') && !voters.includes(m.author) && players.includes(m.author)
                        const votes = game_channel.createMessageCollector({ filter: vote_filter, time: 30000 })
                        votes.on('collect', async (m) => { 
                            if (m.mentions.users.first() || m.content == 'center') {
                                if (m.content == 'center') {
                                    vote_list.push('center')
                                    m.reply(`Vote for **center** confirmed.`)
                                }
                                else if (tags.includes(m.mentions.users.first().tag)) {
                                    vote_list.push(m.mentions.users.first().tag) 
                                    m.reply(`Vote for **${m.mentions.users.first().tag}** confirmed.`)
                                }
                                voters.push(m.author)
                            }
                        })
                        votes.on('end', async () => { 
                            if (vote_list.length == 0) {
                                await interaction.channel.send(`Due to the lack of votes, the Werewolves win!`)
                            }
                            else if (mode(vote_list) == `center`) {
                                await interaction.channel.send(`The center got the most votes. They were...`)
                                .then(() => setTimeout(() => {
                                    resolve(true)
                                }, 4000))
                                .then(() => resolve(interaction.channel.send(`**${new_roles.slice(players.length, players.length + 3).includes(`Werewolf`) ? `the werewolf. The town wins!` : `not the Werewolf. The werewolves win!`}**`)))
                            }
                            else {
                                await interaction.channel.send(`${players[tags.indexOf(mode(vote_list))]} got the most votes. They were the...`)
                                .then(() => setTimeout(() => {
                                    resolve(true)
                                }, 4000))
                                .then(async () => {
                                    if (new_roles[tags.indexOf(mode(vote_list))] == `Hunter`) {
                                        await interaction.channel.send(`**Hunter**. They voted for ${players[tags.indexOf(vote_list[voters.indexOf(players[tags.indexOf(mode(vote_list))])])]}, who was the...`)
                                        .then(() => setTimeout(() => {
                                            resolve(true)
                                        }, 4000))
                                        .then(() => {
                                            interaction.channel.send(`**${new_roles[tags.indexOf(vote_list[voters.indexOf(players[tags.indexOf(mode(vote_list))])])]}**. ${new_roles[tags.indexOf(vote_list[voters.indexOf(players[tags.indexOf(mode(vote_list))])])] == `Werewolf` ? `The town wins!` : `The werewolves win!`}`)
                                        })
                                    }
                                    else if (new_roles[tags.indexOf(mode(vote_list))] == `Tanner`) {
                                        interaction.channel.send(`**Tanner**. ${players[tags.indexOf(mode(vote_list))]} wins!`)
                                    }
                                    else {
                                        interaction.channel.send(`**${new_roles[tags.indexOf(mode(vote_list))]}**. ${new_roles[tags.indexOf(mode(vote_list))] == `Werewolf` ? `The town wins!` : `The werewolves win!`}`)
                                    }
                                    const role_list = []
                                    for (const i in new_roles) {
                                        if (players[i] == undefined) {
                                            role_list.push(`Center: ${new_roles[i]}`)
                                        }
                                        else {
                                            role_list.push(`${tags[i]}: ${new_roles[i]}`)
                                        }
                                    }
                                    console.log(role_list.join(`\n`))
                                })
                            }
                        })
                }))
            }
            else {
                await init_message.edit({ content: `There weren't enough players to start...`, embeds: [] })
            }
        })
        },
}