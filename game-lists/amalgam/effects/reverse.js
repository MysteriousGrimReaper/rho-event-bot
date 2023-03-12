module.exports = {
	name: `re`,
	async effect({ uno_players }) {
		uno_players.reverse();
	},
};
