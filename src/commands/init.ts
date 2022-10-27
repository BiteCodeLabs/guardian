import {
  Guild,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { ICommand } from "wokcommands";
import { config } from "..";

export default {
  category: "Applications",
  description: "Initializes the bot application module",

  permissions: ["ADMINISTRATOR"],
  slash: "both",
  guildOnly: true,

  callback: async ({ guild }) => {
    const joinChannel = guild?.channels.cache.get(
      config.bot.join_channel
    ) as TextChannel;

    const row = new MessageActionRow();

    const embed = new MessageEmbed()
      .setColor("BLUE")
      .addFields({
        name: "Join Message",
        value: `${config.applications.join_message}`,
        inline: true,
      })
      .setTimestamp();

    row.addComponents(
      new MessageButton()
        .setCustomId("apply")
        .setStyle("PRIMARY")
        .setLabel("Apply")
        .setEmoji("📜")
    );

    await joinChannel.send({
      embeds: [embed],
      components: [],
    });
  },
} as ICommand;
