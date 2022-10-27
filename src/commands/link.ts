import { MessageEmbed } from "discord.js";
import { config } from "..";
import { ICommand } from "wokcommands";
import { checkLink, createLink } from "../db";
import { logger } from "../modules/logger";
import { getId } from "../modules/mojang";
import { whitelist } from "../modules/ptero";
import { MinecraftUser } from "../types";

// Create sub command to make it easier to add and remove links

export default {
  category: "Account",
  description: "Links Discord User To Minecraft User ID",

  permissions: ["ADMINISTRATOR"],
  minArgs: 2,
  maxArgs: 2,
  slash: "both",
  testOnly: true,
  guildOnly: true,

  expectedArgs: "<user> <IGN>",
  expectedArgsTypes: ["USER", "STRING"],

  options: [
    {
      name: "user",
      description: "The user to perform the action on",
      type: "USER",
      required: true,
    },
    {
      name: "ign",
      type: "STRING",
      description: "The IGN of the user",
      required: true,
    },
  ],

  callback: async ({ interaction: msgInt, args, guild }) => {
    let userId = args.shift()!;
    const ign = args.shift()!;

    userId = userId.replace(/[<@!>]/g, "");

    const mojangId = (await getId(ign)) as unknown as MinecraftUser;

    if (!mojangId) {
      logger.error("Invalid Minecraft IGN check");
      return "An error occured while trying to link user please check if the ign you provided is valid";
    }

    if (msgInt.guild!.id && userId) {
      try {
        const link = checkLink(mojangId.id);
        if (link) {
          return await msgInt.reply("Link Already Exists");
        }

        createLink(mojangId.id, userId);

        const member = guild?.members.cache.get(userId);

        const embed = new MessageEmbed()
          .setColor("#0099ff")
          .setTitle(`Link Created`)
          .setAuthor({
            name: "Guardian Bot",
            iconURL: "https://i.imgur.com/Yiexscu.png",
          })
          .addFields(
            { name: "Discord Name", value: `${member}`, inline: true },
            { name: "IGN", value: `${ign}`, inline: true }
          )
          .setImage(`https://crafatar.com/renders/body/${mojangId}?scale=3`)
          .setTimestamp();

        await msgInt.reply({ embeds: [embed] });
        whitelist(ign, config.pterodactyl);
      } catch (error) {
        console.log(error);
      }
    }
  },
} as ICommand;
