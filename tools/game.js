module.exports = class Game {
	constructor(player_list) {
		// player_list is an array of Discord User objects
		this.player_list = player_list;
		this.leaderboard = this.player_list.map((p) => {
			return { player: p, score: 0 };
		});
	}
	get game_size() {
		return this.player_list.length;
	}
	leaderboardString({ descending = true, winner = false }) {
		const sortedEntries = this.leaderboard
			.sort((a, b) => (b.score - a.score) * (descending ? 1 : -1)) // Sort entries by value in descending order
			.map(
				(i) =>
					`${i.player?.globalName ?? i.player.username}: ${i.score}`
			) // Map entries to the desired format
			.join("\n"); // Join entries with newline characters
		return `${winner ? `👑 ` : ``}${sortedEntries}`;
	}
	get username_list() {
		return this.player_list.map((p) => p.username);
	}
	get id_list() {
		return this.player_list.map((p) => p.id);
	}
	addPlayer(player) {
		this.player_list.push(player);
		this.leaderboard.push({ player: player, score: 0 });
		console.log(`Added player ${player.username} to game.`);
		return this;
	}
	removePlayer(username) {
		this.player_list = this.player_list.filter(
			(user) => user.username != username
		);
		this.leaderboard = this.leaderboard.filter(
			(player) => player.user.username != username
		);
		console.log(`Removed player ${username} from game.`);
		return this;
	}
	getPlayerFromUsername(username) {
		return this.player_list.find((user) => user.username == username);
	}
	addPoints(player, value) {
		if (this.leaderboard.findIndex((p) => p.player == player) < 0) {
			this.addPlayer(player);
		}
		this.leaderboard.find((p) => p.player == player).score += value;
		console.log(`Added ${value} points to ${player.username}`);
	}
	setPoints(username, value) {
		this.leaderboard[username] = value;
		console.log(`Set ${value} points to ${username}`);
	}
};
