const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
	AttachmentBuilder,
} = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min); // min inclusive, max exclusive
}
class PlayerList extends Array {
	constructor(data) {
		super();
		Object.assign(this, data);
	}
	near(x, y, radius) {
		return this.filter(
			(p) => Math.max(Math.abs(x - p.x), Math.abs(y - p.y)) <= radius
		);
	}
    notFinished() {
        return this.filter(p => !p.is_finished)
    }
    finished() {
        return this.filter(p => p.is_finished)
    }
}
class Node {
	static left = { x: -1, y: 0 };
	static right = { x: 1, y: 0 };
	static up = { x: 0, y: -1 };
	static down = { x: 0, y: 1 };
	constructor(directionX = 0, directionY = 0) {
		this.direction = { x: directionX, y: directionY };
	}

	setDirection(x, y) {
		this.direction.x = x;
		this.direction.y = y;
	}
}
class Maze {
	constructor(data) {
		this.player_list = new PlayerList({ maze: this });
		this.height = data?.height ?? 15;
		this.width = data?.width ?? 15;
		this.map = this.newMap(); // the array of nodes defining the maze
		this.origin = { x: this.width - 1, y: this.height - 1 }; // position of the origin point
		this.nextOrigin = { x: null, y: null }; // position of the next origin point. this is defined here to improve performance
		this.possibleDirections = [
			{ x: -1, y: 0 },
			{ x: 0, y: -1 },
			{ x: 1, y: 0 },
			{ x: 0, y: 1 },
		]; // an array containing the possible directions the origin can travel in
		Object.assign(this, data);
	}
	// returns a map of a valid maze
	newMap() {
		let map = [];
		for (let y = 0; y < this.height; y++) {
			map.push([]);
			for (let x = 0; x < this.width - 1; x++) {
				map[y].push(new Node(1, 0));
			}
			map[y].push(new Node(0, 1));
		}
		map[this.height - 1][this.width - 1].setDirection(0, 0);

		return map;
	}

	setOrigin(x, y) {
		this.origin.x = x;
		this.origin.y = y;
	}
	get buttons() {
		function simpleActionRow(array) {
			return new ActionRowBuilder().setComponents(array);
		}
		function simpleButtonMaker(b_array, disable = false) {
			return new ButtonBuilder()
				.setCustomId(b_array[0])
				.setEmoji(b_array[1])
				.setStyle(b_array[2])
				.setDisabled(b_array[3] ?? disable);
		}
		const raw_buttons = [
			[
				[`sound`, `❔`, ButtonStyle.Success, true],
				[`up`, `⬆️`, ButtonStyle.Primary],
				[`shoot`, `❔`, ButtonStyle.Success, true],
			],
			[
				[`left`, `⬅️`, ButtonStyle.Primary],
				[`dredge`, `❔`, ButtonStyle.Primary, true],
				[`right`, `➡️`, ButtonStyle.Primary],
			],
			[
				[`repair`, `❔`, ButtonStyle.Success, true],
				[`down`, `⬇️`, ButtonStyle.Primary],
				[`shield`, `❔`, ButtonStyle.Success, true],
			],
		];
		const buttons = raw_buttons.map((row) =>
			simpleActionRow(row.map((b) => simpleButtonMaker(b)))
		);
		const d_buttons = raw_buttons.map((row) =>
			simpleActionRow(row.map((b) => simpleButtonMaker(b, true)))
		);
		return buttons;
	}
	setNextOrigin(x, y) {
		this.nextOrigin.x = x;
		this.nextOrigin.y = y;
	}
	findPlayer(name) {
		return this.player_list.find((p) => p.name == name);
	}
	addPlayer(name, x, y, user) {
		const player = new Player({ name, x, y, maze: this, user });
		this.player_list.push(player);
		return player;
	}
	// performs one iteration of the algorithm
	iterate() {
		// select a random direction
		let direction =
			this.possibleDirections[
				getRandomInt(0, this.possibleDirections.length)
			];

		// check if out of bounds
		this.setNextOrigin(
			this.origin.x + direction.x,
			this.origin.y + direction.y
		);
		if (
			this.nextOrigin.x < 0 ||
			this.nextOrigin.x >= this.width ||
			this.nextOrigin.y < 0 ||
			this.nextOrigin.y >= this.height
		)
			return;

		// set the origin nodes direction to this direction
		this.map[this.origin.y][this.origin.x].setDirection(
			direction.x,
			direction.y
		);

		// the node in this direction becomes the new origin node
		this.setOrigin(this.nextOrigin.x, this.nextOrigin.y);
		this.map[this.origin.y][this.origin.x].setDirection(0, 0);
		return this;
	}
	reiterate(i) {
		for (let j = 0; j < i; j++) {
			this.iterate();
		}
	}
}
class Player {
	constructor(data) {
        this.is_finished = false
		Object.assign(this, data);
	}
	async render() {
		const canvas = createCanvas(500, 500);
		const ctx = canvas.getContext("2d");
		ctx.fillStyle = "#20242b";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#22f2eb";
		this.maze.map.forEach((row, j) =>
			row.forEach((cell, i) => {
				ctx.moveTo(
					(i - this.x) * 100 + canvas.width / 2,
					(j - this.y) * 100 + canvas.height / 2
				);
				ctx.lineTo(
					(i - this.x + cell.direction.x) * 100 + canvas.width / 2,
					(j - this.y + cell.direction.y) * 100 + canvas.height / 2
				);
				ctx.stroke();
			})
		);
		const render_books = this.maze.player_list.near(this.x, this.y, 2);
		console.log(render_books);
		for (let b of render_books) {
			const { name } = b;
			const book_path = path.join(
				path.join(__dirname, "../assets/players"),
				`${name}.png`
			);
			let book_image;
			try {
				book_image = await loadImage(book_path);
			} catch {
				book_image = await loadImage(
					path.join(
						path.join(__dirname, "../assets/players"),
						`default.png`
					)
				);
			}
			ctx.drawImage(
				book_image,
				220 + 100 * (b.x - this.x),
				220 + 100 * (b.y - this.y),
				80,
				80
			);
		}
        ctx.fillStyle = '#fff'
        ctx.font = '30px Archivo'
        ctx.fillText(`${this.maze.spots_left - this.maze.player_list.finished().length} spots left!`, 10, 470)
		const buffer = canvas.toBuffer("image/png");
		const attachment = new AttachmentBuilder(buffer, {
			name: "maze-render.png",
		});
		return attachment;
	}
	move({ x, y }) {
		const current_node = this.maze.map[this.y][this.x];
		const dest_node = this.maze.map[this.y + y][this.x + x];
		let valid_flag = false;
		if (current_node.direction.x == x && current_node.direction.y == y) {
			valid_flag = true;
		}
		if (dest_node.direction.x == -x && dest_node.direction.y == -y) {
			valid_flag = true;
		}
		if (!valid_flag) {
			return;
		}
		this.x += x;
		this.y += y;
		return this;
	}
	async game_message() {
		return { files: [await this.render()], components: this.maze.buttons };
	}
    finish() {
        this.is_finished = true
        return this
    }
}
const spots_left = 3
const maze = new Maze({width: 10, height: 10, spots_left});
maze.reiterate(15 * 15 * 4);
module.exports = {
	data: new SlashCommandBuilder()
		.setName("mazegame")
		.setDescription("Begin the maze game."),
	async execute(interaction) {
		const { channel, user } = interaction;
		if (interaction.inGuild()) {
			return await interaction.reply({
				ephemeral: true,
				content: `Wrong channel, use this command in DMs!`,
			});
		}
        const valid_users = [
            `315495597874610178`,
            `822914676483424308`,
            `613431673132154882`
        ]
        /*
        if (!valid_users.includes(user.id)) {
            return await interaction.reply({
				ephemeral: true,
				content: `You can't use this command!`,
			});
        }
            */
		const player =
			maze.findPlayer(user.globalName) ??
			maze.addPlayer(
				user.globalName,
				user.globalName == `MysteriousGrimReaper` ? getRandomInt(0, maze.width) : 0,
				user.globalName == `MysteriousGrimReaper` ? getRandomInt(0, maze.height) : 0,
                user
			);
        
		let game_message = await channel.send(await player.game_message());

		let collector = game_message.createMessageComponentCollector();
		collector.on(`collect`, async (i) => {
            try {
                const { customId } = i;
                player.move(Node[customId]);
                const mgr = maze.findPlayer(`MysteriousGrimReaper`)
                const mgr_pos = [mgr.x, mgr.y]
                
                if (player.x == mgr_pos[0] && player.y == mgr_pos[1] && player.name != `MysteriousGrimReaper` && !player.is_finished) {
                    await i.channel.send(`You found Waldo!`)
                    player.finish()
                    await mgr.user.send(`${player.name} has found you!`)
                }
                await i.update(await player.game_message());
                if (maze.player_list.finished().length >= maze.spots_left) {
                    collector.stop()
                    
                    
                }
            }
			catch {

            }
            
		});
        collector.on(`end`, async() => {
            await maze.player_list.forEach(async (p) => {
                await p.user.send(`**Time's up!** The following players have successfully found Waldo:\n\`\`\`\n${maze.player_list.finished().map(pl => pl.name).join(`\n`)}\`\`\`Unfortunately, these players failed to find Waldo in time:\n\`\`\`\n${maze.player_list.notFinished().map(pl => pl.name).join(`\n`)}\`\`\``)
            })
        })
	},
};
