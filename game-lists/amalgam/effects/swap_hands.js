module.exports = {
	name: `re`,
	async effect({ uno_players }) {
		const first_hand = uno_players[0].hand;
		uno_players.forEach((x, i) => {
			uno_players[i].hand = uno_players[i + 1]?.hand ?? first_hand;
			console.log(uno_players[i + 1]?.hand);
		});
		console.log(uno_players);
		uno_players.forEach((p) =>
			p.user.send(`Your new hand:\n${p.hand.text}`)
		);
		await uno_players.game_channel.send(`All players have swapped hands!`);
	},
};
