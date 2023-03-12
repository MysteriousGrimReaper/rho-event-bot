const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
function createRandomArray(originalArray, length) {
	const newArray = [];
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * originalArray.length);
		newArray.push(originalArray[randomIndex]);
	}
	return newArray;
}
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
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
}
const SECONDS = 45;
module.exports = {
	name: `da`,
	async effect({ uno_players, message }) {
		const dancer = uno_players.next_player();
		const dance_emojis = [
			`➡️`,
			`⬅️`,
			`⬆️`,
			`⬇️`,
			`💃`,
			`🕺`,
			`👏`,
			`💪`,
			`🖐️`,
			`🤟`,
			`🫷`,
			`🫸`,
			`👠`,
		];
		shuffle(dance_emojis);
		dance_emojis.splice(4, dance_emojis.length);
		const left = new ButtonBuilder()
			.setCustomId(`dance-left`)
			.setEmoji(dance_emojis[0])
			.setStyle(ButtonStyle.Primary);
		const right = new ButtonBuilder()
			.setCustomId(`dance-right`)
			.setEmoji(dance_emojis[1])
			.setStyle(ButtonStyle.Primary);
		const up = new ButtonBuilder()
			.setCustomId(`dance-up`)
			.setEmoji(dance_emojis[2])
			.setStyle(ButtonStyle.Primary);
		const down = new ButtonBuilder()
			.setCustomId(`dance-down`)
			.setEmoji(dance_emojis[3])
			.setStyle(ButtonStyle.Primary);
		const dance_row = new ActionRowBuilder().addComponents(
			left,
			up,
			down,
			right
		);
		const routine_ids = [
			`dance-left`,
			`dance-right`,
			`dance-up`,
			`dance-down`,
		];
		const dance_length = 24;
		uno_players.step();
		const backend_dance_routine = createRandomArray(
			[0, 1, 2, 3],
			dance_length
		);
		const dance_routine_ids = backend_dance_routine.map(
			(number) => routine_ids[number]
		);
		const dance_routine = backend_dance_routine.map(
			(number) => dance_emojis[number]
		);
		let move_index = 0;
		const timeTag = `<t:${Math.floor(
			(message.createdTimestamp + SECONDS * 1000) / 1000
		)}:R>`;
		const dance_message = await uno_players.game_channel.send({
			components: [dance_row],
			content: `Dance be upon ye, ${dancer.user}! Finish the dance ${timeTag}, or draw 3 cards:\n${dance_routine[move_index]}`,
		});
		const filter = (i) => i.user.id == dancer.user.id;
		const dance_collector = dance_message.createMessageComponentCollector({
			filter,
			time: SECONDS * 1000,
		});
		dance_collector.on(`ignore`, async (i) => {
			await i.reply({
				ephemeral: true,
				content: `This dance floor ain't for you!`,
			});
		});
		dance_collector.on(`collect`, async (i) => {
			const { customId } = i;
			if (dance_routine_ids[move_index] == customId) {
				move_index++;
				if (move_index >= dance_routine.length) {
					await uno_players.game_channel.send({
						content: `${dancer.user} finished the dance!`,
					});
					dance_collector.stop();
					return;
				}
				await i.update({
					components: [dance_row],
					content: `Dance be upon ye, ${dancer.user}! Finish the dance ${timeTag}, or draw 3 cards:\n${dance_routine[move_index]}`,
				});
			} else {
				await uno_players.game_channel.send(
					`${dancer.user} made the wrong move...`
				);
				dancer.draw(uno_players.drawpile, 3);
				uno_players.step();
				dance_collector.stop();
				return;
			}
		});
		dance_collector.on(`end`, async (collected, reason) => {
			if (reason == `time`) {
				await uno_players.game_channel.send(
					`${dancer.user} did not finish the dance in time...`
				);
				await dance_message.edit({
					components: [],
					content: `Dance be upon ye, ${dancer.user}! Finish the dance ${timeTag}, or draw 3 cards:\n${dance_routine[move_index]}`,
				});
				dancer.draw(uno_players.drawpile, 3);
			}
		});
	},
};
