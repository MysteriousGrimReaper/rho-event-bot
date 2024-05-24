const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

class Signup extends Promise {
  constructor(interaction, game, min_players = 2, minutes = 2) {
    super(async (resolve, reject) => {
      try {
        await interaction.reply({
          content: `Creating signup for ${game}...`,
          ephemeral: true,
        });

        const game_channel = interaction.channel;
        const player_list = [interaction.user];

        const signup_embed = () => {
          return new MessageEmbed()
            .setTitle(`${game} starting! Press Join to join the game.`)
            .setDescription(player_list.map((player) => player.username).join("\n"));
        };

        const start_game_embed = () => {
          return new MessageEmbed()
            .setTitle(`${game} started!`)
            .setDescription(player_list.map((player) => player.username).join("\n"));
        };

        const join_button = new MessageButton()
          .setCustomId("join")
          .setLabel("Join")
          .setStyle("SUCCESS");

        const quit_button = new MessageButton()
          .setCustomId("quit")
          .setLabel("Quit")
          .setStyle("DANGER");

        const start_button = () => {
          return new MessageButton()
            .setCustomId("start")
            .setLabel("Start")
            .setStyle("SECONDARY")
            .setDisabled(player_list.length >= min_players);
        };

        const menu_button_row = new MessageActionRow()
          .addComponents(join_button, quit_button, start_button());

        const send_signup_message = async () => {
          const signup_message = await game_channel.send({
            embeds: [signup_embed()],
            components: [menu_button_row],
          });

          const filter = (i) => i.customId === 'join' || i.customId === 'quit' || i.customId === 'start';

          const collector = signup_message.createMessageComponentCollector({ filter, time: minutes * 1000 * 60 });

          collector.on("collect", async (i) => {
            const { customId } = i;

            if (customId === "join") {
              const user = i.user;
              if (player_list.includes(user)) {
                await i.reply({
                  content: "You are already in the game!",
                  ephemeral: true,
                });
              } else {
                player_list.push(user);
                await i.reply({
                  content: "You have joined the game!",
                  ephemeral: true,
                });
                signup_message.edit({
                  embeds: [signup_embed()],
                  components: [menu_button_row],
                });
              }
            } else if (customId === "quit") {
              const user = i.user;
              if (user.id === interaction.user.id) {
                await i.reply({
                  content: "You can't quit the game, you're the host!",
                  ephemeral: true,
                });
                return;
              }
              const index = player_list.findIndex(
                (player) => player.id === user.id
              );
              if (index !== -1) {
                player_list.splice(index, 1);
                await i.reply({
                  content: "You have quit the game.",
                  ephemeral: true,
                });
                signup_message.edit({
                  embeds: [signup_embed()],
                  components: [menu_button_row],
                });
              }
            } else if (customId === "start") {
              const user = i.user;
              if (player_list[0].id !== user.id) {
                await i.reply({
                  content: "You are not the host, you can't start the game!",
                  ephemeral: true,
                });
              } else if (player_list.length < min_players) {
                await i.reply({
                  content: "There aren't enough players yet!",
                  ephemeral: true,
                });
              } else if (
                player_list.length > 1 &&
                player_list[0].id === user.id
              ) {
                await i.reply({
                  content: "Starting the game...",
                  ephemeral: true,
                });
                collector.stop(`Started`);
              }
            }
          });

          collector.on("end", () => {
            if (player_list.length >= min_players) {
              signup_message.edit({
                embeds: [start_game_embed()],
                components: [],
              });
              resolve(player_list);
            } else {
              signup_message.edit({
                content: `Game closed due to inactivity.`,
                embeds: [],
                components: [],
              });
              resolve(null);
            }
          });
        };

        send_signup_message();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = Signup;
