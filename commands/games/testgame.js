const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
	ActionRowBuilder,
	Events,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const randomColor = require("randomcolor");
const fs = require("fs");
const path = require("path");
const { dir } = require("../dir.json");
const signup_path = path.join(dir, `/tools/signup.js`);
const { create_signup } = require(signup_path);
const game_path = path.join(dir, `/tools/game.js`);
const Game = require(game_path);
module.exports = {
	data: new SlashCommandBuilder()
		.setName("testgame")
		.setDescription("Game for testing."),
	async execute(interaction) {
		const modal_id = `myModal${interaction.id}`;
		const modal = new ModalBuilder()
			.setCustomId(modal_id)
			.setTitle("dd minigame");

		// Add components to modal

		// Create the text input components
		const favoriteColorInput = new TextInputBuilder()
			.setCustomId("word")
			// The label is the prompt the user sees for this input
			.setLabel("Word")
			// Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		const hobbiesInput = new TextInputBuilder()
			.setCustomId("clues")
			.setLabel("Clues (separate by line break)")
			// Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph);

		// An action row only holds one text input,
		// so you need one action row per text input.
		const firstActionRow = new ActionRowBuilder().addComponents(
			favoriteColorInput
		);
		const secondActionRow = new ActionRowBuilder().addComponents(
			hobbiesInput
		);

		// Add inputs to the modal
		modal.addComponents(firstActionRow, secondActionRow);
		console.log(interaction.user.id);
		await interaction.showModal(modal);
		interaction.client.on(
			Events.InteractionCreate,
			async function modal_response(modal_interaction) {
				if (!modal_interaction.isModalSubmit()) return;
				console.log(modal_interaction.user.id);
				const word = modal_interaction.fields.getTextInputValue("word");
				const clues =
					modal_interaction.fields.getTextInputValue("clues");
				if (modal_interaction.customId === modal_id) {
					await modal_interaction.reply({
						content: `Your word: ${word}\nYour clues:\n${clues}`,
						ephemeral: true,
					});
					interaction.client.off(
						Events.InteractionCreate,
						modal_response
					);
				}
			}
		);
	},
};
