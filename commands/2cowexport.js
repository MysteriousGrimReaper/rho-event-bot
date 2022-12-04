const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("2cowex")
        .setDescription("Exports the responses, hosts only.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
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
        const test_channel = interaction.client.channels.cache.get("1041097062407745546")
        await interaction.reply({ ephemeral: true, content: `Responses exported!` })
        await db.all().then(
            async (m) => {
                let message_to_send = ''
                let message_to_send_2 = '\n'
                const responses = []
                for (const i in m) {
                    message_to_send += m[i].id + `\n`
                    message_to_send_2 +=  m[i].value + `\n`
                    responses.push(m[i].value)
                }
                
                shuffle(responses)
                let message2 = '```\nCOW\n'
                let message2_2 = '\n'
                for (const i in responses) {
                    const letter = String.fromCharCode(parseInt(i) + 65)
                    message2 += letter  + `\n`
                    message2_2 += responses[i] + `\n`
                }
                message2 += '\n'
                message2_2 += ''
                await test_channel.send(message_to_send + message_to_send_2)
                .then(async () => await test_channel.send(message2 + message2_2))

            },
        )
    },
}