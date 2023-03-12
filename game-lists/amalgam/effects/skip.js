module.exports = {
	name: `sk`,
	async effect({ uno_players }) {
		uno_players.step();
		await uno_players.game_channel.send(
			`${uno_players.current_user}, skip a turn.`
		);
	},
};
