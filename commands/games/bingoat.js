/* eslint-disable comma-dangle */
/* eslint-disable no-inner-declarations */
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const randomColor = require("randomcolor");
function splitArrayIntoSubarrays(array, subarrayLength) {
	const subarrays = [];
	for (let i = 0; i < array.length; i += subarrayLength) {
		const subarray = array.slice(i, i + subarrayLength);
		subarrays.push(subarray);
	}
	return subarrays;
}
function isNumeric(string) {
	return !isNaN(parseFloat(string)) && isFinite(string);
}
function generateRandomArray() {
	const numbers = Array.from({ length: 50 }, (_, i) => i + 1); // Create an array of numbers from 1 to 50
	const randomArray = [];

	for (let i = 0; i < 24; i++) {
		const randomIndex = Math.floor(Math.random() * numbers.length); // Generate a random index within the remaining numbers
		const randomNumber = numbers[randomIndex]; // Get the number at the random index
		randomArray.push(randomNumber); // Add the number to the random array
		numbers.splice(randomIndex, 1); // Remove the number from the original array
	}
	const middleIndex = Math.floor(randomArray.length / 2);
	randomArray.splice(middleIndex, 0, "F ");

	return splitArrayIntoSubarrays(randomArray, 5);
}
function generateArrayOfArrays(n) {
	const array = [];

	for (let i = 0; i < n; i++) {
		const randomArray = generateRandomArray();
		array.push(randomArray);
	}

	return array;
}
function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}

	return array;
}
function isBingoWinner(board, announcedNumbers) {
	// Check rows
	for (let i = 0; i < board.length; i++) {
		if (board[i].every((number) => announcedNumbers.includes(number))) {
			return true;
		}
	}

	// Check columns
	for (let i = 0; i < board.length; i++) {
		const column = [];
		for (let j = 0; j < board.length; j++) {
			column.push(board[j][i]);
		}
		if (column.every((number) => announcedNumbers.includes(number))) {
			return true;
		}
	}

	// Check diagonals
	const diagonal1 = [];
	const diagonal2 = [];
	for (let i = 0; i < board.length; i++) {
		diagonal1.push(board[i][i]);
		diagonal2.push(board[i][board.length - 1 - i]);
	}
	if (
		diagonal1.every((number) => announcedNumbers.includes(number)) ||
		diagonal2.every((number) => announcedNumbers.includes(number))
	) {
		return true;
	}

	return false;
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName("bingoat")
		.setDescription("Play a game of Bingoat!"),

	async execute(interaction) {
		const time_limit = 120;

		const players = [interaction.user];
		const tags = [interaction.user.tag];
		function updateEmbed({ start = false } = {}) {
			return new EmbedBuilder()
				.setTitle(
					start
						? `Game started!`
						: `Bingoat game starting! React to this message to join. ${interaction.user.username}, react to the message when you are ready to begin! \n(Make sure you have DM permissions enabled)`
				)
				.setDescription(tags.join(`\n`));
		}
		let init_embed = updateEmbed();
		await interaction.reply(`Starting game...`);
		const init_message = await interaction.channel.send({
			embeds: [init_embed],
		});
		init_message.react(`☑️`);
		let filter = (reaction, user) => {
			return user.id != interaction.client.user.id;
		};
		const signup = init_message.createReactionCollector({ filter });
		signup.on("collect", async (reaction, user) => {
			if (user.id == interaction.user.id) {
				signup.stop();
			} else if (!tags.includes(user.tag)) {
				players.push(user);
				tags.push(user.tag);
				init_embed = updateEmbed();
				await init_message.edit({ embeds: [init_embed] });
			}
		});
		signup.on(`end`, async () => {
			const cards = generateArrayOfArrays(players.length);
			const announcedNumbers = ["F "];
			players.forEach(async (player, index) => {
				const board = cards[index];
				const regex = /(?<![0-9])[0-9](?![0-9])/g;
				const bingotext = board
					.join(`\n`)
					.replaceAll(",", " | ")
					.replace(regex, "$& ");
				await player.send(
					`Here is your bingo card:\n\`\`\`${bingotext}\`\`\``
				);
				await player.send(
					`Choose a number to add or remove from the bingo cage.`
				);
				filter = (m) =>
					m.content.toLowercase().replace(/[^a-zA-Z0-9]/g, "") ==
						"bingo" ||
					isNumeric(
						m.content.toLowercase().replace(/[^a-zA-Z0-9]/g, "")
					);
				const bingoCollector = player.dmChannel.createMessageCollector({
					filter,
				});
				bingoCollector.on(`collect`, async (message) => {
					const messageFiltered = message.content
						.toLowercase()
						.replace(/[^a-zA-Z0-9]/g, "");
					if (
						messageFiltered == "bingo" &&
						isBingoWinner(board, announcedNumbers)
					) {
						await player.send(`Congratulations, you won!`);
					}
				});
				console.log(cards[index]);
			});
		});
	},
};
