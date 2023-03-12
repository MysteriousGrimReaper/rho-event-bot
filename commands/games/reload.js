const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("reloadgame")
		.setDescription("Reloads a game command.")
		.addStringOption((option) =>
			option
				.setName("command")
				.setDescription("The command to reload.")
				.setRequired(true)
		),
	async execute(interaction) {
		const user_ids = [
			`1014413186017021952`,
			`315495597874610178`,
			`889657025347350571`,
			`709631847923187793`,
			`224214982756270082`,
		];
		if (!user_ids.includes(interaction.user.id)) {
			return interaction.reply(
				`Halt, creature of clay. I did not permit you to do that`
			);
		}
		const commandName = interaction.options
			.getString("command", true)
			.toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(
				`There is no command with name \`${commandName}\`!`
			);
		}

		delete require.cache[require.resolve(`./${command.data.name}.js`)];

		try {
			interaction.client.commands.delete(command.data.name);
			const newCommand = require(`./${command.data.name}.js`);
			interaction.client.commands.set(newCommand.data.name, newCommand);
			await interaction.reply(
				`Command \`${newCommand.data.name}\` was reloaded!`
			);
		} catch (error) {
			console.error(error);
			await interaction.reply(
				`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``
			);
		}
	},
};
