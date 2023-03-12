module.exports = {
	name: `+3`,
	draw_stackable: true,
	async effect({ uno_players }) {
		uno_players.draw_stack += 3;
	},
};
