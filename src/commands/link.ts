import { config } from "..";
import logger from "../modules/logger";
import { ICommand } from "wokcommands";
import { getId } from "../modules/mojang";
import { MessageEmbed } from "discord.js";
import { whitelist } from "../modules/ptero";
import { checkLink, createLink } from "../db";

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

    const mojangId = await getId(ign);

    if (!mojangId) {
      logger.error("Invalid Minecraft IGN check");
      return "An error occured while trying to link user please check if the ign you provided is valid";
    }

    if (msgInt.guild!.id && userId) {
      try {
        const link = checkLink(mojangId);
        if (await link) {
          return await msgInt.reply("Link Already Exists");
        }

        await createLink(mojangId, userId);

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

        if (!config.pterodactyl) {
          logger.warn(
            "Pterodactyl module has not been enabled or is missing from your config file"
          );
          return "Pterodactyl module has not been enabled or is missing from your config file";
        }

        await whitelist(ign, config.pterodactyl);
      } catch (error) {
        logger.error("Oh nowo", error);
      }
    }
  },
} as ICommand;
