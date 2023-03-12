const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const SECONDS = 7;
module.exports = {
	name: `hu`,
	async effect({ uno_players }) {
		let current_turn_index = uno_players.current_turn_index;
		let seconds_elapsed = 0;
		const player_checker = setInterval(() => {
			if (current_turn_index == uno_players.current_turn_index) {
				seconds_elapsed++;
				if (SECONDS - seconds_elapsed == 3) {
					uno_players.game_channel.send(
						`${uno_players.current_user} 3 seconds left!`
					);
				}
			} else {
				seconds_elapsed = 0;
				current_turn_index = uno_players.current_turn_index;
			}
		}, 1000);
		const intervalStopper = setInterval(function () {
			if (seconds_elapsed >= SECONDS) {
				clearInterval(player_checker); // Stop the interval
				clearInterval(intervalStopper); // Stop the stopper interval
				uno_players.game_channel.send(
					`${uno_players.current_user} took too long, draw 3 cards! It's still ${uno_players.current_user}'s turn.`
				);
				uno_players.current_player.draw(uno_players.drawpile, 3);
			}
		}, 1000);
	},
};
