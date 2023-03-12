module.exports = {
	name: `-c`,
	async effect({ uno_players, card_chosen, pile_chosen, player }) {
		const init_hand_length = player.hand.length;
		player.discard_color(card_chosen.front.color, pile_chosen);
		const final_hand_length = player.hand.length;
		await uno_players.game_channel.send(
			`${player.user.username} discarded ${
				init_hand_length - final_hand_length
			} cards! The top card is now ${pile_chosen.top_card.text}.`
		);
	},
};
