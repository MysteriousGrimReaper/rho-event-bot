/* eslint-disable no-case-declarations */
const { SlashCommandBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const fish_inventories = db.table(`inventories`);

const fish_list = [
	{ name: "Pufferfish 🐡", value: 29, start: 12, end: 16, weight: 620 },
	{ name: "Anchovy 🐟", value: 13, start: 0, end: 24, weight: 2500 },
	{ name: "Tuna 🐟", value: 26, start: 6, end: 19, weight: 1020 },
	{ name: "Sardine 🐟", value: 13, start: 6, end: 19, weight: 2500 },
	{ name: "Bream 🐟", value: 14, start: 18, end: 2, weight: 2500 },
	{ name: "Largemouth Bass 🐟", value: 19, start: 6, end: 19, weight: 2050 },
	{ name: "Smallmouth Bass 🐟", value: 12, start: 0, end: 24, weight: 2500 },
	{ name: "Rainbow Trout 🐠", value: 18, start: 6, end: 19, weight: 2310 },
	{ name: "Salmon 🐟", value: 19, start: 6, end: 19, weight: 2050 },
	{ name: "Walleye 🐠", value: 18, start: 12, end: 4, weight: 2310 },
	{ name: "Perch 🐠", value: 14, start: 0, end: 24, weight: 2500 },
	{ name: "Carp 🐠", value: 8, start: 0, end: 24, weight: 2500 },
	{ name: "Catfish 🐟", value: 28, start: 6, end: 24, weight: 800 },
	{ name: "Pike 🐠", value: 23, start: 0, end: 24, weight: 1480 },
	{ name: "Sunfish 🐠", value: 13, start: 6, end: 19, weight: 2500 },
	{ name: "Red Mullet 🐟", value: 21, start: 6, end: 19, weight: 1755 },
	{ name: "Herring 🐟", value: 11, start: 0, end: 24, weight: 2500 },
	{ name: "Eel 🐟", value: 26, start: 16, end: 2, weight: 1020 },
	{ name: "Octopus 🐟", value: 34, start: 6, end: 13, weight: 130 },
	{ name: "Red Snapper 🐟", value: 16, start: 6, end: 19, weight: 2500 },
	{ name: "Squid 🐟", value: 28, start: 18, end: 2, weight: 800 },
	{ name: "Sea Cucumber 🐟", value: 16, start: 6, end: 19, weight: 2500 },
	{ name: "Super Cucumber 🐟", value: 29, start: 18, end: 2, weight: 620 },
	{ name: "Ghostfish 🐠", value: 19, start: 0, end: 24, weight: 2050 },
	{ name: "Stonefish 🐡", value: 24, start: 0, end: 24, weight: 1260 },
	{ name: "Ice Pip 🐟", value: 31, start: 0, end: 24, weight: 435 },
	{ name: "Lava Eel 🐟", value: 33, start: 0, end: 24, weight: 270 },
	{ name: "Sandfish 🐠", value: 24, start: 6, end: 20, weight: 1260 },
	{ name: "Scorpion Carp 🐠", value: 33, start: 6, end: 20, weight: 270 },
	{ name: "Flounder 🐡", value: 19, start: 6, end: 20, weight: 2050 },
	{ name: "Midnight Carp 🐟", value: 21, start: 22, end: 2, weight: 1755 },
	{ name: "Sturgeon 🐟", value: 29, start: 6, end: 19, weight: 682 },
	{ name: "Tiger Trout 🐠", value: 23, start: 6, end: 19, weight: 1480 },
	{ name: "Bullhead 🐠", value: 18, start: 0, end: 24, weight: 2268 },
	{ name: "Tilapia 🐠", value: 19, start: 6, end: 14, weight: 2050 },
	{ name: "Chub 🐟", value: 14, start: 0, end: 24, weight: 2500 },
	{ name: "Dorado 🐠", value: 29, start: 6, end: 19, weight: 682 },
	{ name: "Albacore 🐟", value: 23, start: 18, end: 11, weight: 1480 },
	{ name: "Shad 🐟", value: 18, start: 9, end: 2, weight: 2310 },
	{ name: "Lingcod 🐠", value: 31, start: 0, end: 24, weight: 435 },
	{ name: "Halibut 🐟", value: 19, start: 19, end: 11, weight: 2050 },
	{ name: "Woodskip 🐠", value: 19, start: 0, end: 24, weight: 2050 },
	{ name: "Void Salmon 🐟", value: 29, start: 0, end: 24, weight: 620 },
	{ name: "Slimejack 🐟", value: 21, start: 0, end: 24, weight: 1755 },
	{ name: "Stingray 🐠", value: 29, start: 0, end: 24, weight: 620 },
	{ name: "Lionfish 🐠", value: 19, start: 0, end: 24, weight: 2050 },
	{ name: "Blue Discus 🐟", value: 23, start: 0, end: 24, weight: 1480 },
	{ name: "Frog 🐸", value: 40, start: 12, end: 24, weight: 1 },
	{ name: "Trash 📌", value: 2, start: 0, end: 10, weight: 20 },
	{ name: "Trash 💿", value: 2, start: 1, end: 11, weight: 20 },
	{ name: "Trash 🔩", value: 2, start: 2, end: 12, weight: 20 },
	{ name: "Trash 🧱", value: 2, start: 3, end: 13, weight: 20 },
	{ name: "Trash 🧽", value: 2, start: 4, end: 14, weight: 20 },
	{ name: "Trash ✉️", value: 2, start: 5, end: 15, weight: 20 },
	{ name: "Trash 📎", value: 2, start: 6, end: 16, weight: 20 },
	{ name: "Trash 📰", value: 2, start: 7, end: 17, weight: 20 },
	{ name: "Trash 💡", value: 2, start: 8, end: 18, weight: 20 },
	{ name: "Trash 📼", value: 2, start: 9, end: 19, weight: 20 },
	{ name: "Trash ⚙️", value: 2, start: 10, end: 20, weight: 20 },
	{ name: "Trash 🚬", value: 2, start: 11, end: 21, weight: 20 },
	{ name: "Trash 🧻", value: 2, start: 12, end: 22, weight: 20 },
	{ name: "Trash 💊", value: 2, start: 13, end: 23, weight: 20 },
	{ name: "Trash 🔑", value: 2, start: 14, end: 24, weight: 20 },
	{ name: "Trash 🧴", value: 2, start: 15, end: 1, weight: 20 },
	{ name: "Trash 🎈", value: 2, start: 16, end: 2, weight: 20 },
	{ name: "Trash 🎀", value: 2, start: 17, end: 3, weight: 20 },
	{ name: "Trash 🏷️", value: 2, start: 18, end: 4, weight: 20 },
	{ name: "Trash 🧷", value: 2, start: 19, end: 5, weight: 20 },
	{ name: "Trash 📍", value: 2, start: 20, end: 6, weight: 20 },
	{ name: "Trash 🖇️", value: 2, start: 21, end: 7, weight: 20 },
	{ name: "Trash 📏", value: 2, start: 22, end: 8, weight: 20 },
	{ name: "Trash 🔋", value: 2, start: 23, end: 9, weight: 20 },
];

function pickRandomWeightedValue(array) {
	const currentHour = new Date().getHours();
	let totalWeight = 0;
	for (const obj of array) {
		if (
			(obj.start <= currentHour && obj.end >= currentHour) ||
			(obj.start > obj.end &&
				(obj.start <= currentHour || obj.end >= currentHour))
		) {
			totalWeight += obj.weight;
		}
	}
	let randomNum = Math.random() * totalWeight;
	for (const obj of array) {
		if (
			(obj.start <= currentHour && obj.end >= currentHour) ||
			(obj.start > obj.end &&
				(obj.start <= currentHour || obj.end >= currentHour))
		) {
			randomNum -= obj.weight;
			if (randomNum <= 0) {
				return obj;
			}
		}
	}
}
const commandStates = new Map();
module.exports = {
	data: new SlashCommandBuilder()
		.setName("fishe")
		.setDescription("Fish up a fish!")
		.addSubcommand((subcommand) =>
			subcommand
				.setName(`cast`)
				.setDescription(`Cast your line out for a fish!`)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(`inventory`)
				.setDescription(`Check which fish you have.`)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName(`sell`)
				.setDescription(`Sell all the fish you have.`)
		),
	async execute(interaction) {
		const fish = pickRandomWeightedValue(fish_list);
		const userId = interaction.user.id;
		const channelId = interaction.channel.id;

		switch (interaction.options._subcommand) {
			case `cast`:
				let state = commandStates.get(userId);
				if (!state) {
					state = new Map();
					commandStates.set(userId, state);
				}
				if (state.get(channelId)) {
					await interaction.reply(
						`Your fishing rod needs time to recharge!`
					);
					return;
				}
				await interaction.reply(`You caught: **${fish.name}**!`);
				await fish_inventories.push(
					`${interaction.user.id}.fish`,
					fish.name
				);
				state.set(channelId, true);
				setTimeout(() => {
					state.set(channelId, false);
				}, 30000);
				break;
			case `inventory`:
				await interaction.deferReply();
				const balance = await fish_inventories.get(
					`${interaction.user.id}.balance`
				);
				await fish_inventories
					.get(`${interaction.user.id}.fish`)
					.then((inventory) => {
						if (!inventory) {
							interaction.editReply(
								`**${
									balance ?? 0
								} 🪙**\nYou don't have any fish. Go and catch some with \`/fishe cast\`!`
							);
						} else {
							interaction.editReply(
								`**${balance ?? 0} 🪙**\n${inventory.join(
									`\n`
								)}`
							);
						}
					});
				break;
			case `sell`:
				await interaction.deferReply();
				const inventory_value = (
					await fish_inventories.get(`${interaction.user.id}.fish`)
				)?.reduce((acc, cur) => {
					const fishItem = fish_list.find(
						(item) => item.name === cur
					);
					return acc + (fishItem ? fishItem.value : 0);
				}, 0);
				if (inventory_value) {
					interaction.editReply(
						`You sold all the fish for **${inventory_value}** 🪙!`
					);
				} else {
					interaction.editReply(
						`You don't have any fish! Use \`/fishe cast\` to catch some fish.`
					);
				}
				await fish_inventories.add(
					`${interaction.user.id}.balance`,
					inventory_value
				);
				await fish_inventories.delete(`${interaction.user.id}.fish`);
		}
	},
};
