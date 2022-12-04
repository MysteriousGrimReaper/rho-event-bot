const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { clearInterval } = require('node:timers');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sscirclestart")
        .setDescription("Begin speed circle! For event hosts only.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        await db.deleteAll()
        function mode(arr){
            return arr.sort((a, b) =>
                  arr.filter(v => v === a).length
                - arr.filter(v => v === b).length).pop();
        }
        const death_messages =
        ['was struck by lightning!']
        const death_ids = [
            '772156111465349121',
            '241371232983973888',
            '357983991296557056',
            '476241113892519949',
            `292451628781666304`,
            `526433701719179284`,
        ]
        const c_death_messages = [
            'died #ripbozo we smokin that yoshikid pack',
            `has been demoted from 'Moderator' to '3rd choice Janitor' due to inactivity.`,
            `was sent to hell.`,
            `@NeuroL04#9200`,
            `TAHAHHAHAHHAHAHAHHAHAHAHHAHAHAHAHHAHAHAHAHHAHAHAHHAHAHAHHAHAHHAHAHAHHAHAHAHAHHAHAHHAHAHHAHAHAHHAHAHAHAAHAHHAHAHAHHAHAHHAHAHAHHAHAHHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAAAAAHHHHHHhhHHHAAAAaaAAAaAaAaAaAaAaAAAaaAAaAaaA`,
            `Spanish boi goes BRRRRRRRRRRRR`,
        ]
        const elim_channel = interaction.channel
        await interaction.reply(`Starting game of Supersonic Circle!`)
        let participants = interaction.guild.roles.cache.find(role => role.name == "Event Contenders").members.size;
        const interval = setInterval(async function() {
            participants = interaction.guild.roles.cache.find(role => role.name == "Event Contenders").members.size;
            if (participants <= 1) {
                clearInterval(interval)
            }
            
            await db.all()
            .then(async (a) => {
                const votes = []
                for (const i in a) {
                    votes.push(a[i].value)
                }
                const voted = mode(votes)
                console.log(votes)
                await elim_channel.send(`**<@${voted.id}> ${death_ids.includes(voted.id) ? c_death_messages[death_ids.indexOf(voted.id)] : death_messages[Math.floor(Math.random() * death_messages.length)]}**`)
                .then(
                    async() => await elim_channel.guild.members.cache.get(voted.id).roles.remove("600137520306716707"),
                )
                .then(async () =>
                    await elim_channel.guild.members.cache.get(voted.id).roles.add("600137819876360222"),
                )
                .then(
                    async () => await db.deleteAll(),
                )
                .catch(
                    async() => await interaction.channel.send(`There was a tie! Make sure to revote.`),
                )
            })
        }, 10000);
        

    },
}