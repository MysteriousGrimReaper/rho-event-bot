/* eslint-disable no-sparse-arrays */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable curly */
/* eslint-disable no-inner-declarations */
const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
} = require("discord.js");
const fs = require("fs");
const { clearInterval } = require("timers");
const wait = require("node:timers/promises").setTimeout;
const path = require("path");
const { dir } = require("../dir.json");
const signup_path = path.join(dir, `/tools/signup.js`);
const { create_signup } = require(signup_path);
const { Events, ButtonStyle, ActionRowBuilder } = require("discord.js");
const mode = (a) => {
	a = a.slice().sort((x, y) => x - y);

	var bestStreak = 1;
	var bestElem = a[0];
	var currentStreak = 1;
	var currentElem = a[0];

	for (let i = 1; i < a.length; i++) {
		if (a[i - 1] !== a[i]) {
			if (currentStreak > bestStreak) {
				bestStreak = currentStreak;
				bestElem = currentElem;
			}

			currentStreak = 0;
			currentElem = a[i];
		}

		currentStreak++;
	}

	return currentStreak > bestStreak ? currentElem : bestElem;
};
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
function reduceArray(arr) {
	// Create an object to store the latest values for each unique voter
	const latestValues = {};

	// Iterate through the array
	arr.forEach((obj) => {
		// Check if the voter property already exists in latestValues
		if (latestValues.hasOwnProperty(obj.voter)) {
			// If it exists, update the value
			latestValues[obj.voter] = obj;
		} else {
			// If it doesn't exist, add it to latestValues
			latestValues[obj.voter] = obj;
		}
	});

	// Convert the values of latestValues back to an array
	const reducedArray = Object.values(latestValues);

	return reducedArray;
}
function reduceArrayWithLastN(arr, n) {
	if (n <= 0) {
		return arr;
	}
	// Create an object to store arrays of values for each unique voter
	const latestValues = {};

	// Iterate through the array
	arr.forEach((obj) => {
		// Check if the voter property already exists in latestValues
		if (latestValues.hasOwnProperty(obj.voter)) {
			// If it exists, update the array of values
			const valuesArray = latestValues[obj.voter];
			valuesArray.push(obj);

			// Keep only the last n values
			if (valuesArray.length > n) {
				valuesArray.shift();
			}
		} else {
			// If it doesn't exist, add it to latestValues with an array of values
			latestValues[obj.voter] = [obj];
		}
	});

	// Flatten the arrays of values back to a single array
	const reducedArray = Object.values(latestValues).flat();

	return reducedArray;
}
module.exports = {
	data: new SlashCommandBuilder()
		.setName("apeirogon")
		.setDescription("Begin 1 round of Apeirogon! For event hosts only.")
		.addChannelOption((option) =>
			option
				.setName("vote_channel")
				.setDescription(
					"What channel should be used to collect votes? (If not bot)"
				)
				.setRequired(true)
		),
	async execute(interaction) {
		const game_channel = interaction.channel;
		const vote_channel = interaction.options.getChannel("vote_channel");

		const player_list = await create_signup({
			interaction,
			game_name: "Apeirogon",
			min_players: 3,
		});
		const vote_history = [];
		if (player_list !== null) {
			/*
            non-flag events:
            vote for someone random to rejoin
            vote for someone random to be zapped
            vote for a bingo number to be added
            vote for a random twist to be added
            vote for an extra vote to be distributed
            vote for an immunity idol to be distributed
            vote for a random player's vote history to be revealed
            vote for elimination to end now
            vote for a random congregation jumpscare video to be played ("mystery video")
            vote for rock paper scissors, players who choose winning move get an extra vote, but players who choose losing move get an extra vote placed on them
            */
			let max_votes = 1; // people can only cast n votes
			let vote_time_seconds = 25; // time people have to vote
			let vote_eliminated_to_rejoin = false; // the general gamerule for voting eliminated to rejoin, also make separate proposal for bringing back people specifically
			let fair_ties = false; // do vote redos for ties
			let wheel_elim = false; // decide eliminations by wheel
			let vote_publicly = false; // players must vote by pinging someone in the game channel
			let public_vote_counts = false; // vote counts are public
			let greed_votes = false; // only possible if dupe votes is active, cast 1/3 of the votes to be eliminated instead
			let teams = false; // only active if players >= 6, a team is randomly selected to be ufe and the team members will vote on them
			let elim_mode = false; // twow, bpr, speed_counter, prisoners_dilemma, musical_chairs
			// twow - turns next elimination into a twow
			// bpr - turns next elimination into a bpr
			// speed_counter - turns next elimination into a speed counter
			// prisoners_dilemma - turns next elimination into a prisoners dilemma between the top two most voted players
			// musical_chairs - turns next elimination into musical chairs
			let bingo = false; // everyone gets bingo cards, if all bingo numbers are called then you win a prize
			let shop = false; // getting voted gives you currency
			let sniper_elim = false; // elimination chance for person X (number of votes for person X)/(number of non-abstain votes)
			let eliminated_number = 1; // number of players eliminated per round
			let embed_display = false;
			const bingo_numbers = [...Array(76).keys()];
			bingo_numbers.shift();
			let bingo_index = 0;
			shuffle(bingo_numbers);
			const event_texts = [
				{
					id: 0,
					text: `All contestants may vote as many times as they like.`,
				},
				{ id: 1, text: `All contestants can vote up to 2 times.` },
				{
					id: 2,
					text: `Contestants can vote eliminated players to rejoin if the vote is unanimous.`,
				},
				{
					id: 3,
					text: `Tied votes will have another round to decide who should be eliminated.`,
				},
				{
					id: 4,
					text: `Eliminations will be decided by a (private) wheel.`,
				},
				{
					id: 5,
					text: `All contestants must vote by pinging who they want to vote in ${vote_channel}`,
				},
				{ id: 6, text: `Vote counts be made public.` },
				{
					id: 7,
					text: `The bot reminds all contestants every 30 seconds to vote.`,
				},
				{
					id: 8,
					text: `Contestants must be punished for their greed.`,
				},
				{ id: 9, text: `The contestants be divided into teams.` },
				{
					id: 10,
					text: `The next round's elimination will be decided by a round of TWOW.`,
				},
				{
					id: 11,
					text: `The next round's elimination will be decided by a round of Bombparty Roulette.`,
				},
				{
					id: 12,
					text: `The next round's elimination will be decided by a round of Speed Counter.`,
				},
				{
					id: 13,
					text: `The next round's elimination will be decided by a round of Prisoner's Dilemma.`,
				},
				{
					id: 14,
					text: `The next round's elimination will be decided by a round of Musical Chairs.`,
				},
				{
					id: 15,
					text: `All contestants get bingo cards which give unique rewards.`,
				},
				{ id: 16, text: `A shop using votes as currency gets built.` },
				{ id: 17, text: `Contestants may get sniped.` },
				{
					id: 18,
					text: `Each round, 2 players should get eliminated.`,
				},
				{
					id: 19,
					text: `A fancy embed be used to display the eliminations.`,
				},
				{
					id: 20,
					text: `A random previously eliminated contestant rejoins.`,
				},
				{ id: 21, text: `A random contestant gets zapped.` },
				{ id: 22, text: `A bingo number gets announced.` },
				{ id: 23, text: `A random twist is activated.` },
				{
					id: 24,
					text: `Someone gets extra voting power for this round.`,
				},
				{ id: 25, text: `Someone is immune this round.` },
				{ id: 26, text: `A random player's vote history is revealed.` },
				{ id: 27, text: `The current round's elimination ends now.` },
				{ id: 28, text: `A mystery video plays.` },
				{
					id: 29,
					text: `We play Rock Paper Scissors. If you win, you get extra voting power. If you lose, you will receive an extra vote placed upon you.`,
				},
			];

			const eliminated_list = [];
			const proposals = [];
			let tie_flag = false;
			await game_channel.send(
				`Apeirogon game started!\n${player_list.join(
					` `
				)} DM <@1035006209817853974> your vote by typing out the username of who you want to vote out.`
			);
			let current_votes = [];
			interaction.client.on(Events.MessageCreate, async (message) => {
				// debug
				if (message.content == `settings`) {
					console.log(`max_votes: ${max_votes}`);
					console.log(`vote_time_seconds: ${vote_time_seconds}`);
					console.log(
						`vote_eliminated_to_rejoin: ${vote_eliminated_to_rejoin}`
					);
					console.log(`fair_ties: ${fair_ties}`);
					console.log(`wheel_elim: ${wheel_elim}`);
					console.log(`vote_publicly: ${vote_publicly}`);
					console.log(`public_vote_counts: ${public_vote_counts}`);
					console.log(`reminders: ${reminders}`);
					console.log(`greed_votes: ${greed_votes}`);
					console.log(`teams: ${teams}`);
					console.log(`elim_mode: ${elim_mode}`);
					console.log(`bingo: ${bingo}`);
					console.log(`shop: ${shop}`);
					console.log(`sniper_elim: ${sniper_elim}`);
					console.log(`eliminated_number: ${eliminated_number}`);
					console.log(`embed_display: ${embed_display}`);
				}
				if (!player_list.includes(message.author)) {
					return;
				}
				if (
					(!message.channel.isDMBased() && !vote_publicly) ||
					(message.channel.id != vote_channel.id && vote_publicly)
				) {
					return;
				}

				const total_list = [...player_list, ...eliminated_list];
				console.log(vote_eliminated_to_rejoin);
				console.log(total_list);
				if (
					!total_list
						.map((user) => user.username.toLowerCase())
						.includes(message.content.toLowerCase()) &&
					!total_list
						.map((user) => user.globalName?.toLowerCase())
						.includes(message.content.toLowerCase())
				) {
					return;
				}

				const vote_index = total_list
					.map((user) => user.globalName.toLowerCase())
					.indexOf(message.content.toLowerCase());
				if (
					vote_index >= player_list.length &&
					!vote_eliminated_to_rejoin
				) {
					return;
				}
				current_votes.push({
					voter: message.author.id,
					vote_index:
						vote_index -
						(vote_eliminated_to_rejoin &&
						vote_index >= player_list.length
							? player_list.length
							: 0),
					save:
						vote_index >= player_list.length &&
						vote_eliminated_to_rejoin,
					voted_user:
						player_list[
							vote_index -
								(vote_eliminated_to_rejoin &&
								vote_index >= player_list.length
									? player_list.length
									: 0)
						],
					voted_user_id:
						player_list[
							vote_index -
								(vote_eliminated_to_rejoin &&
								vote_index >= player_list.length
									? player_list.length
									: 0)
						].id,
				});
				await message.reply(
					`Your vote has been recorded for \`${message.content}\`.`
				);
			});
			async function reminderTimer() {
				await wait(30 * 1000);
				if (player_list.length <= 1) {
					return;
				}
				await game_channel.send(
					`${player_list.join(` `)} reminder to vote!`
				);
				await reminderTimer();
			}
			async function proposalTimer(seconds, index, pr_index = undefined) {
				// debug
				const debug_index = -1;
				const proposal_index =
					pr_index ??
					Math.floor(
						Math.random() *
							(debug_index >= 0
								? debug_index
								: event_texts.length)
					);
				proposals.push({
					proposal_number: proposal_index,
					votes: [],
				});
				const check_button = new ButtonBuilder()
					.setCustomId(`accept-${index}`)
					.setLabel("Accept")
					.setEmoji(`✅`)
					.setStyle(ButtonStyle.Success);
				const reject_button = new ButtonBuilder()
					.setCustomId(`reject-${index}`)
					.setLabel("Reject")
					.setEmoji(`✖️`)
					.setStyle(ButtonStyle.Danger);
				const default_button_row = new ActionRowBuilder().addComponents(
					check_button,
					reject_button
				);
				const rock = new ButtonBuilder()
					.setCustomId(`rock-${index}`)
					.setLabel("Rock")
					.setEmoji(`🪨`)
					.setStyle(ButtonStyle.Secondary);
				const paper = new ButtonBuilder()
					.setCustomId(`paper-${index}`)
					.setLabel("Paper")
					.setEmoji(`📰`)
					.setStyle(ButtonStyle.Secondary);
				const scissors = new ButtonBuilder()
					.setCustomId(`scissors-${index}`)
					.setLabel("Scissors")
					.setEmoji(`✂️`)
					.setStyle(ButtonStyle.Secondary);
				const rps_button_row = new ActionRowBuilder().addComponents(
					rock,
					paper,
					scissors
				);
				const choices = [true, false, false];
				shuffle(choices);

				const proposal_embed = new EmbedBuilder()
					.setTitle(`Proposal #${index}: It is proposed that...`)
					.setDescription(event_texts[proposal_index].text);
				await wait(seconds * 1000);
				if (player_list.length == 1) {
					return;
				}
				const proposal_message = await game_channel.send({
					embeds: [proposal_embed],
					components: [
						proposal_index == 29
							? rps_button_row
							: default_button_row,
					],
				});
				const proposal_vote_collector =
					proposal_message.createMessageComponentCollector({
						// debug
						time: 10000, // change back to 60000
					});
				proposal_vote_collector.on(`collect`, async (i) => {
					const { customId, user } = i;
					if (!player_list.includes(user)) return;
					console.log(customId);
					const acceptance = customId.startsWith(`accept`);
					const rejectance = customId.startsWith(`reject`);
					const rock_choice = customId.startsWith(`rock`);
					const paper_choice = customId.startsWith(`paper`);
					const scissors_choice = customId.startsWith(`scissors`);
					if (!acceptance && !rejectance) {
						proposals[index].votes.push({
							voter: user,
							choice: [
								rock_choice,
								paper_choice,
								scissors_choice,
							],
						});
						await i.reply({
							ephemeral: true,
							content: `You have chosen ${
								rock_choice
									? `rock`
									: paper_choice
									? `paper`
									: scissors_choice
									? `scissors`
									: `something went wrong if you see this`
							}.`,
						});
						return;
					}
					proposals[index].votes.push({
						voter: user,
						acceptance: acceptance,
					});

					await i.reply({
						ephemeral: true,
						content: `You have voted to ${
							customId.startsWith(`accept`) ? `accept` : `reject`
						} proposal #${index}.`,
					});
				});
				const proposal_effect = async (p_index) => {
					switch (p_index) {
						case 0:
							max_votes = 0;
							break;
						case 1:
							max_votes = 2;
							break;
						case 2:
							vote_eliminated_to_rejoin = true;
							break;
						case 3:
							fair_ties = true;
							break;
						case 4:
							wheel_elim = true;
							break;
						case 5:
							vote_publicly = true;
							break;
						case 6:
							public_vote_counts = true;
							break;
						case 7:
							reminderTimer();
							break;
						case 8:
							greed_votes = true;
							break;
						case 9:
							teams = true;
							break;
						case 10:
							elim_mode = `twow`;
							break;
						case 11:
							elim_mode = `bpr`;
							break;
						case 12:
							elim_mode = `sc`;
							break;
						case 13:
							elim_mode = `pd`;
							break;
						case 14:
							elim_mode = `mc`;
							break;
						case 15:
							bingo = true;
							break;
						case 16:
							shop = true;
							break;
						case 17:
							sniper_elim = true;
							break;
						case 18:
							eliminated_number = 2;
							break;
						case 19:
							embed_display = true;
							break;
						case 20:
							player_list.push(
								eliminated_list.splice(
									Math.floor(
										Math.random() * eliminated_list.length
									),
									1
								)
							);
							await game_channel.send(
								`${
									player_list[player_list.length - 1]
								} has rejoined!`
							);
							break;
						case 21:
							eliminated_list.push(
								player_list.splice(
									Math.floor(
										Math.random() * player_list.length
									),
									1
								)
							);
							await game_channel.send(
								`:zap: **${
									eliminated_list[eliminated_list.length - 1]
								}**`
							);
							break;
						case 22:
							bingo_index++;
							await game_channel.send(
								`Your new bingo number: ${bingo_numbers[bingo_index]}`
							);
							break;
						case 23:
							await proposal_effect(
								Math.floor(Math.random() * event_texts.length)
							);
							break;
						case 24:
							// someone gets additional voting power
							break;
						case 25:
							// someone gets immunity
							break;
						case 26:
							// reveal a random vote history
							break;
						case 27:
							await eliminate();
							break;
						case 28:
							await game_channel.send(
								`https://www.youtube.com/watch?v=bnZnhuIv0wo`
							);
							break;
						case 29:
							choices;
							reduceArray(proposals[index].votes).forEach(
								async (p) => {
									if (p.choice == choices) {
										return;
									}
									if (
										(p.choice[0] && choices[1]) ||
										(p.choice[1] && choices[2]) ||
										(p.choice[2] && choices[0])
									) {
										await p.user.send(
											`You lost the RPS match...`
										);
										current_votes.push({
											voter: p.user.id,
											vote_index: player_list
												.map((u) => u.id)
												.indexOf(p.user.id),
											voted_user:
												player_list[
													player_list
														.map((u) => u.id)
														.indexOf(p.user.id)
												],
											voted_user_id:
												player_list[
													player_list
														.map((u) => u.id)
														.indexOf(p.user.id)
												].id,
										});
										return;
									}
									await p.user.send(`You won the RPS match!`);
									current_votes.forEach((v) => {
										if (v.voter == p.user.id) {
											v.vote_power = 2;
										}
									});
								}
							);
							break;
						default:
							console.log(
								`There was an error with one of the indices... (received ${proposal_index})`
							);
							break;
					}
				};
				proposal_vote_collector.on(`end`, async () => {
					if (player_list.length == 1) {
						return;
					}
					const proposal_accept =
						reduceArray(proposals[index].votes).filter(
							(p) => p.acceptance
						).length -
							reduceArray(proposals[index].votes).filter(
								(p) => !p.acceptance
							).length >=
						0;
					if (proposal_accept) {
						await proposal_effect(proposal_index);
					}
					await proposal_message.edit({
						embeds: [proposal_embed],
						components: [],
					});
					if (proposal_index == 29) {
						await proposal_effect(proposal_index);
						return;
					}
					await proposal_message.reply(
						`Proposal #${index} has been ${
							proposal_accept ? `accepted` : `rejected`
						}.`
					);
				});
				proposalTimer(Math.random() * 45 + 30, index + 1);
			}
			async function eliminate() {
				const normal_votes = reduceArrayWithLastN(
					current_votes,
					max_votes
				);
				if (normal_votes.filter((v) => !v.save).length < 1) {
					await game_channel.send(
						`There were no elimination votes, eliminating someone at random...`
					);
					const v_index = Math.floor(
						Math.random() * player_list.length
					);
					normal_votes.push({
						voter: `1114727295001841716`,
						vote_index: v_index,
						voted_user: player_list[v_index],
						voted_user_id: player_list[v_index].id,
					});
				}
				const elim_votes = normal_votes.filter((v) => !v.save);

				const save_votes = normal_votes.filter((v) => v.save);
				const vote_names = reduceArray(elim_votes).map(
					(v) => v.voted_user_id
				);
				const vote_values = vote_names.map((name) =>
					normal_votes
						.filter((v) => v.voted_user_id == name)
						.map((v) => v.vote_power ?? 1)
						.reduce((partialSum, a) => partialSum + a, 0)
				);
				const total_elim_votes = vote_names.map((_, index) => [
					vote_names[index],
					vote_values[index],
				]);
				total_elim_votes.sort((a, b) => b[1] - a[1]);
				console.log(`normal_votes:`);
				console.log(normal_votes);
				console.log(`elim_votes:`);
				console.log(elim_votes);
				console.log(`save_votes: ${save_votes}`);
				console.log(`vote_names: ${vote_names}`);
				console.log(`vote_values: ${vote_values}`);
				console.log(`total_elim_votes:`);
				console.log(total_elim_votes);
				if (
					fair_ties &&
					total_elim_votes[0][1] == (total_elim_votes[1] ?? [,])[1] &&
					!tie_flag &&
					!wheel_elim
				) {
					await game_channel.send(
						`There was a tie between ${player_list.find(
							(user) => user.id == total_elim_votes[0][0]
						)} and ${player_list.find(
							(user) => user.id == total_elim_votes[1][0]
						)}. Revote for one of them.`
					);
					tie_flag = true;
					current_votes = [];
					return;
				}

				const voted_out_index = player_list.findIndex(
					(user) => user.id == total_elim_votes[0][0]
				);
				console.log(`voted_out_index: ${voted_out_index}`);
				const save_vote_names = reduceArray(
					save_votes.map((v) => v.voted_user_id)
				);
				console.log(`save_vote_names: ${save_vote_names}`);
				const save_vote_values = save_vote_names.map((name) =>
					normal_votes
						.filter((v) => v.voted_user_id == name)
						.map((v) => v.vote_power ?? 1)
						.reduce((partialSum, a) => partialSum + a, 0)
				);
				console.log(`save_vote_values: ${save_vote_values}`);
				const total_save_votes = save_vote_names.map((_, index) => [
					save_vote_names[index],
					save_vote_values[index],
				]);
				total_save_votes.sort((a, b) => b[1] - a[1]);
				console.log(`total_save_values: ${total_save_votes}`);
				const save_voted_index = eliminated_list.findIndex(
					(user) => user.id == (total_save_votes[0] ?? [])[0]
				);
				console.log(`save_voted_index: ${save_voted_index}`);
				if (vote_eliminated_to_rejoin && save_vote_names.length > 0) {
					await game_channel.send(
						`:angel: **${eliminated_list[save_voted_index]}**`
					);
					player_list.push(
						...eliminated_list.splice(save_voted_index, 1)
					);
				}
				await game_channel.send(
					`:zap: **${player_list[voted_out_index]}**`
				);
				eliminated_list.push(...player_list.splice(voted_out_index, 1));

				if (player_list.length == 1) {
					await game_channel.send(
						`**${player_list.join(``)} has won!** :crown:`
					);
					return true;
				}
				await game_channel.send(
					`New round started!\n${player_list.join(
						` `
					)} DM <@1035006209817853974> your vote by typing out the username of who you want to vote out.`
				);
				vote_history.push(current_votes);
				current_votes = [];
				tie_flag = false;
			}
			async function repeatTimer(seconds) {
				await wait(seconds * 1000);
				const win = await eliminate();
				if (win) {
					return;
				}
				const new_time = vote_time_seconds;
				await repeatTimer(new_time);
			}

			// proposalTimer(Math.random() * 45 + 30, 0);
			// debug
			proposalTimer(0, 0, 3);
			await repeatTimer(vote_time_seconds);
		} else {
			await game_channel.send(`Game closed due to inactivity.`);
		}
	},
};
