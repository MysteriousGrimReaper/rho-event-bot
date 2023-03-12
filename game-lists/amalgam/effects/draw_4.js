module.exports = {
	name: `+4`,
	draw_stackable: true,
	async effect({ uno_players }) {
		uno_players.draw_stack += 4;
	},
};
