module.exports = {
	name: `+9`,
	draw_stackable: true,
	async effect({ uno_players }) {
		uno_players.draw_stack += 9;
	},
};
