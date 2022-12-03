const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder()
        .setName("signups-start")
        .setDescription("Begin signups! For event hosts only.")
        .addIntegerOption(option => option.setName('minutes')
            .setDescription("How many minutes should signups be open for?")
            .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const signups = interaction.client.channels.cache.get("718189137701765190")
        const minutes = interaction.options.getInteger("minutes")
        await interaction.reply(`Opening signups! Signups close <t:${Math.floor((Date.now() + 60000 * minutes) / 1000)}:R>.`);
        await signups.permissionOverwrites.create(signups.guild.roles.everyone, { SendMessages: true });
        const col = signups.createMessageCollector({ time: minutes * 60000 })
        col.on('collect', async(m) => {
            const person = signups.guild.members.cache.get(m.author.id);
            if (person != undefined) {
                person.roles.add("600137520306716707")
            }

        })
        col.on('end', async() => {
            await signups.permissionOverwrites.create(signups.guild.roles.everyone, { SendMessages: false });
            await interaction.channel.send("Signups are now closed.");
        })

    },
}