module.exports = {
	name: `+8`,
	draw_stackable: true,
	async effect({ uno_players }) {
		uno_players.draw_stack += 8;
	},
};
