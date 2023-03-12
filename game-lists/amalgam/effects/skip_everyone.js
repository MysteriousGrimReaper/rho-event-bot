module.exports = {
	name: `se`,
	async effect({ uno_players }) {
		uno_players.step(true);
	},
};
