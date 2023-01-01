/* eslint-disable no-unused-vars */
/* eslint-disable no-inner-declarations */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-case-declarations */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const randomColor = require('randomcolor');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('5alive')
        .setDescription('Starts a game of Five Alive.'),
    async execute(interaction) {
        
        const cards = [`0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `draw`, `back`, `reverse`, `skip`, `=21`, `=10`, `=0`, `shuffle`, `x2`]
        const game_channel = interaction.channel
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
            .setTitle(start ? `Game started!` : `Five Alive game starting! React to this message to join. ${interaction.user.username}, react to the message when you are ready to begin! \n(Make sure you have DM permissions enabled)`)
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
        signup.on('end', async () => {
            const deaths = []
            if (players.length >= 2) {
                init_embed = updateEmbed({ start: true })
                await init_message.edit({ embeds: [init_embed] })
                let current_turn = 0
                let stack = 0
                const bank = []
                for (const i in players) {
                    const t_bank = []
                    while (t_bank.length < 7) {
                        t_bank.push(cards[Math.floor(Math.random() * cards.length)])
                    }
                    bank.push(t_bank)
                }
                const play_order = []
                for (const i in players) {
                    if (Math.random() > 0.5) {
                        play_order.push(players[i])
                    }
                    else {
                        play_order.unshift(players[i])
                    }
                }
                let index_shuffle = Math.floor(Math.random() * play_order.length)
                while (index_shuffle > 0) {
                    play_order.unshift(play_order.pop())
                    index_shuffle--
                }
                for (const i in play_order) {
                    play_order[i].send(`Your hand:\n${bank[i].join(`\n`)}`)
                }
                function kill_player() {
                    interaction.channel.send(`The stack blew up on ${play_order[current_turn]}! It has reset back to 0.`)
                    for (let i = 0; i < 4; i++) {
                        bank[current_turn].push(cards[Math.floor(Math.random() * cards.length)])
                    }
                    stack = 0
                    deaths.push(play_order[current_turn])
                }
                async function turn_play() {
                    await interaction.channel.send(`${play_order[current_turn]} it's your turn! Choose a card to play. (Type the name of the card in the bot's DMs.) (Stack: ${stack})`)
                    // card submit
                .then(() => new Promise((resolve) => {
                    console.log(`card submit`)
                    filter = (m) => bank[current_turn].includes(m.content) || m.content == `quit`
                    const current_cards = new EmbedBuilder()
                    .setTitle('Your hand:')
                    .setDescription(`${bank[current_turn].join(`\n`)}`)
                    .setColor(randomColor())
                    .setFooter({ text:`Type 'quit' to quit.` });
                    play_order[current_turn].send({ embeds: [current_cards] })
                    const card_col = play_order[current_turn].dmChannel.createMessageCollector({ filter, time: 60000, max: 1 })
                    card_col.on(`end`, (collected, reason) => {
                        if (reason == `time`) {
                            stack += 12345
                            interaction.channel.send(`The player did not submit in time...`)
                            resolve(false)
                        }
                        else if (collected.first().content == `quit`) {
                            bank.splice(current_turn, 1)
                            play_order.splice(current_turn, 1)
                            current_turn--
                            resolve(false)
                        }
                        else {
                            bank[current_turn].splice(bank[current_turn].indexOf(collected.first().content), 1)
                            if (bank[current_turn].length > 0) {
                                resolve(collected.first().content)
                            }
                            else {
                                resolve(`win`)
                            }
                        }
                    })
                }))
                .then((card) => new Promise((resolve) => {
                    console.log(`card process`)
                    if (card) {
                        interaction.channel.send(`${play_order[current_turn]} played a **${card}**!`)
                        console.log(parseInt(card))
                        if (!Number.isNaN(parseInt(card))) {
                            stack += parseInt(card)
                            interaction.channel.send(`The stack value is now **${stack}**!`)
                            resolve(`stack_check`)
                        }
                        else {
                            switch (card) {
                                case `win`:
                                    resolve(`win`)
                                    break
                                case `draw`:
                                    for (const i in bank) {
                                        if (i != current_turn) {
                                            bank[i].push(cards[Math.floor(Math.random() * cards.length)])
                                            play_order[i].send(`You drew a **${bank[i][bank[i].length - 1]}**`)
                                        }
                                    }
                                    resolve(false)
                                    break
                                case `back`:
                                    current_turn--
                                    resolve(`back`)
                                    break
                                case `reverse`:
                                    const current_player = play_order[current_turn]
                                    play_order.reverse()
                                    bank.reverse()
                                    while (play_order[current_turn] != current_player) {
                                        play_order.unshift(play_order.pop())
                                        bank.unshift(bank.pop())
                                    }
                                    resolve(false)
                                    break
                                case `skip`:
                                    current_turn++
                                    current_turn = current_turn % bank.length
                                    interaction.channel.send(`**${play_order[current_turn]}**'s turn was skipped!`)
                                    resolve(false)
                                    break
                                case `x2`:
                                    stack *= 2
                                    interaction.channel.send(`The stack value is now **${stack}**!`)
                                    resolve(`stack_check`)
                                    break
                                case `=21`:
                                    stack = 21
                                    interaction.channel.send(`The stack value is now **${stack}**!`)
                                    resolve(false)
                                    break
                                case `=10`:
                                    stack = 10
                                    interaction.channel.send(`The stack value is now **${stack}**!`)
                                    resolve(false)
                                    break
                                case `=0`:
                                    stack = 0
                                    interaction.channel.send(`The stack value is now **${stack}**!`)
                                    resolve(false)
                                    break
                                case `shuffle`:
                                    const bank_length = bank.length
                                    const shuffled_cards = []
                                    for (const i in bank) {
                                        while (bank[i].length > 0) {
                                            shuffled_cards.push(bank[i].pop())
                                        }
                                    }
                                    shuffle(shuffled_cards)
                                    let i = 0
                                    while (shuffled_cards.length % bank.length != 0) {
                                        shuffled_cards.pop()
                                    }
                                    while (shuffled_cards.length > 0) {
                                        bank[i].push(shuffled_cards.pop())
                                        i++
                                        i %= bank_length
                                    }
                                    i = 0
                                    while (i < deaths.length) {
                                        for (let j = 0; j < 4; j++) {
                                            bank[play_order.indexOf(deaths[i])].push(cards[Math.floor(Math.random() * cards.length)])
                                        }
                                        i++
                                    }
                                    interaction.channel.send(`Everyone's cards have been reshuffled! (Everyone now has the same amount of cards!)`)
                                    resolve(false)
                                    break
                            }
                        }
                        
                    }
                    else {
                        resolve(`stack_check`)
                    }
                }))
                .then((card_case) => new Promise ((resolve) => {
                    console.log(`effect process`)
                    switch (card_case) {
                        case `win`:
                            resolve(`win`)
                            break
                        case `back`:
                            current_turn--
                            resolve(true)
                            break
                        case `stack_check`:
                            if (stack > 21) {
                                kill_player()
                            }
                            resolve(true)
                            break
                        default:
                            resolve(true)
                    }
                }))
                .then((win_con) => new Promise((resolve) => {
                    console.log(`turn process`)
                    if (win_con == `win`) {
                        if (stack > 21) {
                            kill_player()
                        }
                        else {
                            interaction.channel.send(`${play_order[current_turn]} has won!`)
                        }
                    }
                    current_turn++
                    if (current_turn < 0) {
                        current_turn = bank.length + current_turn
                    }
                    current_turn = current_turn % bank.length
                    if (win_con != `win`) {
                        turn_play()
                    }
                    console.log(current_turn)
                    
                }))
                }
                turn_play()
                
            }
            else {
                console.log(players[0])
                await init_message.edit({ content: `There weren't enough players to start...`, embeds: [] })
            }
        })
        },
}