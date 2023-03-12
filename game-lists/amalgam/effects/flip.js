module.exports = {
	name: `f`,
	async effect({ uno_players }) {
		uno_players.forEach((p) => {
			p.hand.flip();
			p.user.send(`Your new hand:\n${p.hand.text}`);
		});
		uno_players.drawpile.flip();
		await uno_players.game_channel.send(
			`All cards have been flipped! The top cards are: \n${uno_players.drawpile.discard_pile_text()}`
		);
	},
};
