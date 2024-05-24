const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { clearInterval } = require("node:timers");
const wait = require("node:timers/promises").setTimeout;
const path = require("path");
const { dir } = require("../dir.json");
const signup_path = path.join(dir, `/tools/signup.js`);
const { create_signup } = require(signup_path);
const DISCORD_EPOCH = 1420070400000;
const mode = (a) => {
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
module.exports = {
	data: new SlashCommandBuilder()
		.setName("speedcircle")
		.setDescription("Begin speed circle!")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
		const game_channel = interaction.channel;
		let player_list = await create_signup({
			interaction,
			game_name: "Speed Circle",
			minutes: 10,
			channel: game_channel,
		});
		if (player_list != null) {
			let jury_condition = false;
			player_list.forEach(
				async (user) =>
					await interaction.guild.members
						.fetch(user.id)
						.then((member) =>
							member.roles.add([`600137520306716707`])
						)
						.then((member) =>
							member.roles.remove([`600137819876360222`])
						)
						.catch((err) => console.log(err))
			);
			const find_player_by_user = (username) => {
				return player_list.find(
					(user) =>
						user.globalName == username || user.username == username
				);
			};
			const get_member = async (name) => {
				return await interaction.guild.members
					.fetch()
					.find((member) => member.nickname == name);
			};
			let votes = {};
			interaction.client.on(`messageCreate`, async (message) => {
				if (message.inGuild() || message.author.bot) {
					return;
				}
				if (
					!jury_condition &&
					!player_list.map((p) => p.id).includes(message.author.id)
				) {
					return;
				}
				if (
					jury_condition &&
					!(await interaction.guild.members
						.fetch(message.author.id)
						.roles.cache.some(
							(role) => role.id == `600137819876360222`
						))
				) {
					return;
				}
				const vote =
					message.mentions?.members?.first()?.id ??
					find_player_by_user(message.content)?.id ??
					(await get_member(message.content))?.id;
				const voter = message.author.id;
				if (!(vote && voter)) {
					console.log(vote);
					return;
				}
				votes[voter] = vote;
				await message.reply(
					`Your vote has been recorded for <@${vote}>.`
				);
			});
			await game_channel.send(
				`<@&600137520306716707> Vote a player out in 5 minutes by typing their username in <@1041070495119966358>'s DMs.\n${player_list
					.map((user) => user.globalName ?? user.username)
					.join(`\n`)}`
			);
			const interval = setInterval(async () => {
				const total_votes = Object.values(votes);
				if (total_votes.length == 0) {
					total_votes.push(player_list[0].id);
				}
				const voted_out = mode(total_votes); // id
				const voted_out_member = interaction.guild.members
					.fetch(voted_out)
					.then((member) =>
						member.roles.remove([`600137520306716707`])
					)
					.then((member) => member.roles.add([`600137819876360222`]))
					.catch((err) => console.log(err));
				await game_channel.send(`⚡ <@${voted_out}>`);
				player_list = player_list.filter(
					(user) => user.id != voted_out
				);
				console.log(votes);
				votes = {};
				if (player_list.length == 2) {
					jury_condition = true;
					await game_channel.send(
						`Jury vote! <@&600137819876360222> vote for the last player to be eliminated!`
					);
					return;
				}
				if (player_list.length == 1) {
					await game_channel.send(
						`# ${player_list[0]} survived the Speed Circle! :crown:`
					);
					clearInterval(interval);
					return;
				}
				await game_channel.send(
					`<@&600137520306716707> Vote a player out in 5 minutes.\n${player_list
						.map((user) => user.globalName ?? user.username)
						.join(`\n`)}`
				);
			}, 1000 * 60 * 1); // CHANGE THIS BACK TO 5
		} else {
			await game_channel.send(`Game closed due to inactivity.`);
		}
	},
};
