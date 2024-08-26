const { REST, Routes } = require("discord.js");
const {
	clientId,
	guildId,
	token,
	testToken,
	testClientId,
} = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");
const test = false;
const commands = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	if (commandsPath.endsWith(`.json`)) {
		continue;
	}
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		try {
			const command = require(filePath);
			if ("data" in command && "execute" in command) {
				commands.push(command.data.toJSON());
			} else {
				console.log(
					`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
				);
			}
		}
		catch (error) {
			console.log(error)
			continue
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: "10" }).setToken(test ? testToken : token);

// and deploy your commands!
(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		);

		// The put method is used to fully refresh all commands in the guild with the current set
		/*rest.put(Routes.applicationCommands(clientId), { body: [] })
            .then(() => console.log('Successfully deleted all application commands.'))
            .catch(console.error);
        rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
            .then(() => console.log('Successfully deleted all guild commands.'))
            .catch(console.error);*/
		const data = await rest.put(
			Routes.applicationCommands(test ? testClientId : clientId),
			{
				body: commands,
			}
		);

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`
		);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
