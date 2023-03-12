const path = require("path");
const { dir } = require("./dir.json");
const amalgam_path = path.join(dir, `/game-lists/amalgam`);
const { color_map, icon_map, emoji_map, special_emoji_map } = require(path.join(
	amalgam_path,
	`/maps.js`
));
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
/**
 * Represents a card object, with a front and back side.
 *
 * @param {CardFace} front The front of the card.
 * @param {CardFace} back The back of the card. (For Uno Flip)
 */
class Card {
	constructor(front, back = null) {
		this.front = front;
		this.back = back;
	}
	get color() {
		return this.front.color;
	}
	get icon() {
		return this.front.icon;
	}
	get emoji() {
		return this.front.emoji;
	}
	get modifiers() {
		return this.front.modifiers;
	}
	set color(c) {
		this.front.color = c;
	}
	set icon(i) {
		this.front.icon = i;
	}
	set modifiers(m) {
		this.front.modifiers = m;
	}
	flip() {
		[this.front, this.back] = [this.back, this.front];
	}
	get text() {
		return this.front.text;
	}
	get back_text() {
		return this.back.text;
	}
}
/**
 * Represents a card's face.
 * @param {string} icon The card number or symbol. Cards with matching icons can be matched together.
 * @param {string} color The card's colour. Cards with matching colors can be matched together.
 * @param {array} modifiers The modifiers(s) that the card has. All modifierss are strings.
 */
class CardFace {
	constructor(icon, color, modifiers) {
		this.icon = icon; // card number or symbol (string)
		this.color = color; // card colour (string)
		this.emoji = /^\d+$/.test(icon)
			? emoji_map.get(this.color)
			: special_emoji_map.get(this.color);
		// r: red
		// b: blue
		// g: green
		// y: yellow
		// m: magenta
		// p: pink
		// o: orange
		// s: silver (gray)
		this.modifiers = modifiers ?? []; // what modifiers(s) the card has (array)
		this.aliases = [
			// all ways to refer to the card
			`${this.color} ${this.icon}`,
			`${this.color} ${this.icon}`.toLowerCase(),
			`${this.color} ${this.icon}`.toUpperCase(),
			this.text,
			this.text.toLowerCase(),
			this.text.toUpperCase(),
		];
	}
	/**
	 *
	 * @returns The text information of a card.
	 */
	get text() {
		let card_text = ``;
		const color_name = color_map.get(this.color);
		card_text += `${color_name} ` ?? ``;
		const icon_name = icon_map.get(this.icon) ?? this.icon;
		card_text += `${icon_name} `;
		card_text +=
			this.modifiers.length > 0
				? ` (+ ${this.modifiers.join(`, `)})`
				: ``;
		return card_text.trim();
	}
}
/**
 * Represents an UNO player.
 *
 * @param {User} user A Discord User object.
 */
class Player {
	constructor(user) {
		this.user = user; // discord user
		this.hand = new Hand(); // Hand
		this.uno_callable = false; // boolean
		this.towers = [];
		this.character;
	}
	get id() {
		return this.user.id;
	}
	draw(drawpile, number) {
		const cards_drawn = [];
		for (let i = 0; i < number; i++) {
			cards_drawn.push(drawpile.draw(this));
		}
		if (this.hand.length == 1) {
			this.uno_callable = true;
		} else {
			this.uno_callable = false;
		}
		return cards_drawn;
	}
	/**
	 * Plays a card from the player's hand, activating its effect.
	 * @param {string} card Text of the card being played.
	 * @param {DiscardPile} discardpile The discard pile to play the card on.
	 */
	play(card, discardpile) {
		discardpile.push(this.hand.remove_card(card));

		if (this.hand.length == 1) {
			this.uno_callable = true;
		} else {
			this.uno_callable = false;
		}
	}
	discard(card, discardpile) {
		discardpile.push(this.hand.remove_card(card));

		if (this.hand.length == 1) {
			this.uno_callable = true;
		} else {
			this.uno_callable = false;
		}
	}
	discard_color(color, discardpile) {
		for (let i = 0; i < this.hand.length; i++) {
			while (this.hand[i]?.front?.color == color) {
				this.play(this.hand[i], discardpile);
			}
		}
	}
}
/**
 * Represents a hand which contains cards.
 */
class Hand extends Array {
	add_card(card) {
		this.push(card);
	}
	/**
	 *
	 * @param {Card} card The card to remove.
	 * @returns The removed card.
	 */
	remove_card(card) {
		// console.log(card);
		return this.splice(this.indexOf(card), 1)[0];
	}
	remove_card_by_index(index) {
		// console.log(card);
		return this.splice(index, 1)[0];
	}
	check_for_card(card_text) {
		return this.find((card_in_hand) =>
			card_in_hand.front.aliases.includes(card_text.toUpperCase())
		);
	}
	get text() {
		return `- ${this.map((card) => card.text).join(`\n- `)}`;
	}
	get back_text() {
		return `- ${this.map((card) => card.back_text).join(`\n- `)}`;
	}
	flip() {
		this.forEach((card) => card.flip());
	}
}
/**
 * Represents a pile from which players draw from.
 */
class DrawPile extends Array {
	constructor() {
		super();
		this.discardpiles = [];
	}
	activate_all_discard_piles() {
		this.discardpiles.forEach((dp) => (dp.active = true));
	}
	set_inactive_discard_pile(index) {
		this.discardpiles[index].active = false;
	}
	set_new_inactive_discard_pile(index) {
		this.activate_all_discard_piles();
		this.set_inactive_discard_pile(index);
	}
	least_active_discard_pile() {
		let i = 0;
		while (!this.discardpiles[i].active) {
			i++;
		}
		return i;
	}
	draw(player) {
		if (this.length == 0) {
			this.reshuffle();
		}
		const card_drawn = this.pop();
		player.hand.add_card(card_drawn);
		return card_drawn;
	}
	addDiscardPile(discardpile) {
		this.discardpiles.push(discardpile);
	}
	discard(discardpileindex) {
		this.discardpiles[discardpileindex].push(this.pop());
	}
	reshuffle() {
		this.discardpiles.forEach((pile) => {
			while (pile.length > 1) {
				this.push(pile.shift());
			}
			shuffle(this);
		});
	}
	flip() {
		this.forEach((card) => card.flip());
		for (let i = 0; i < this.length; i++) {
			[this[i], this[this.length - i - 1]] = [
				this[this.length - i - 1],
				this[i],
			];
		}
		this.discardpiles.forEach((dp) => dp.flip());
	}
	check_match() {
		return this.check_match_color() || this.check_match_icon();
	}
	check_match_color() {
		return (
			this.discardpiles
				.map((pile) => pile.top_card.front.color)
				.reduce((acc, cv) => (acc == cv ? cv : false)) != false
		);
	}
	check_match_icon() {
		return (
			this.discardpiles
				.map((pile) => pile.top_card.front.icon)
				.reduce((acc, cv) => (acc == cv ? cv : false)) != false
		);
	}
	discard_pile_text(inactive_pile_index = -1) {
		return this.discardpiles
			.map(
				(dp, i) =>
					`- ${i + 1 == inactive_pile_index ? `~~` : ``}Pile ${
						i + 1
					}: **${dp.top_card.text}**${
						i + 1 == inactive_pile_index ? `~~` : ``
					}`
			)
			.join(`\n`);
	}
	load(card_deck) {
		const load_deck = card_deck;
		shuffle(load_deck);
		const card_deck_front = load_deck.slice(0, load_deck.length / 2);
		const card_deck_back = load_deck.slice(
			load_deck.length / 2,
			load_deck.length
		);

		this.push(
			...card_deck_front.map(
				(card, index) =>
					new Card(
						new CardFace(
							card.icon,
							card.color,
							card.wild,
							card.wild_colors,
							card.modifiers
						),
						new CardFace(
							card_deck_back[index].icon,
							card_deck_back[index].color,
							card_deck_back[index].wild,
							card_deck_back[index].wild_colors,
							card_deck_back[index].modifiers
						)
					)
			)
		);
		this.card_shuffle();
		return this;
	}
	card_shuffle() {
		shuffle(this);
	}
	get top_card() {
		return this[this.length - 1];
	}
}
/**
 * Represents a pile to which players place cards upon.
 */
class DiscardPile extends Array {
	constructor() {
		super();
		this.active = true;
	}
	flip() {
		this.forEach((card) => card.flip());
		for (let i = 0; i < this.length; i++) {
			[this[i], this[this.length - i - 1]] = [
				this[this.length - i - 1],
				this[i],
			];
		}
	}
	remove_card(card_text) {
		return this.splice(
			this.findIndex((card_in_pile) =>
				card_in_pile.front.aliases.includes(card_text)
			),
			1
		)[0];
	}
	get top_card() {
		return this[this.length - 1];
	}
}
/**
 * Represents a counter which can hold a certain value.
 */
class Counter {
	constructor(max = 0) {
		this.max = max;
		this.value = 0;
	}
	step(steps, fn) {
		this.value += steps;
		if (this.value >= this.max) {
			fn();
		}
	}
}

/**
 * Manages all the players.
 */
class PlayerManager extends Array {
	constructor() {
		super();
		this.current_turn_index = 0;
		this.play_direction = 1;
		this.draw_stack = 0;
		this.input_state = false;
		this.winners_list = [];
		this.losers_list = [];
	}
	get current_user() {
		return this.current_player.user;
	}
	get current_player() {
		return this[this.current_turn_index];
	}
	load(player_list) {
		this.push(
			...player_list.map((user) => {
				return new Player(user);
			})
		);
		return this;
	}
	setGameInfo(interaction) {
		this.game_channel = interaction.channel;
		return this;
	}
	setMainDrawPile(drawpile) {
		this.drawpile = drawpile;
		return this;
	}
	setWildDrawPile(drawpile) {
		this.wild_drawpile = drawpile;
		return this;
	}
	/**
	 * Returns the next player.
	 */
	next_player(index = 1) {
		return this[
			(this.current_turn_index +
				index * this.play_direction +
				this.length) %
				this.length
		];
	}
	/**
	 * Goes to the next player.
	 * @param back Whether or not to go backwards. (false by default)
	 */
	step(back = false) {
		this.current_turn_index +=
			this.play_direction * (back ? -1 : 1) + this.length;
		this.current_turn_index %= this.length;
		return this;
	}
	/**
	 * Reverses the turn order.
	 */
	reverse() {
		this.play_direction *= -1;
	}
	/**
	 * Returns all the users
	 */
	get user_map() {
		return this.map((player) => player.user);
	}
	/**
	 * Returns the user ids
	 */
	get id_map() {
		return this.user_map.map((user) => user.id);
	}
	/**
	 * Find a player based on their user id.
	 * @param {String} id The user ID.
	 */
	find_player(id) {
		const index = this.id_map.indexOf(id);
		return this[index];
	}
	/**
	 * Find a player based on their name.
	 * @param {String} name The username/globalName.
	 */
	find_player_by_name(name) {
		const usernames = this.user_map
			.map((user) => user.username)
			.indexOf(name);
		const globalNames = this.user_map
			.map((user) => user.globalName?.toLowerCase())
			.indexOf(name);
		return this[Math.max(usernames, globalNames)];
	}
	/**
	 * Remove a player based on their user id.
	 * @param {String} id The user ID.
	 */
	remove_player(id) {
		console.log(this.id_map);
		if (!this.id_map.indexOf(id)) {
			console.log(`Could not find user with id ${id}`);
			return;
		}
		this.splice(this.id_map.indexOf(id), 1);
		this.step(true);
		return this;
	}
	add_winner(id) {
		this.winners_list.push(this.find_player(id));
		this.remove_player(id);
	}
	add_loser(id) {
		this.losers_list.push(this.find_player(id));
		this.remove_player(id);
	}
	/**
	 * Remove the current player.
	 */
	remove_current_player() {
		this.splice(this.current_player_index, 1);
		this.step(true);
	}
}

module.exports = {
	Player,
	PlayerManager,
	Counter,
	DiscardPile,
	DrawPile,
	Card,
	CardFace,
	Hand,
	shuffle,
};
