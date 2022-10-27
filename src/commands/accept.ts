import { ICommand } from "wokcommands";
import { MessageEmbed, TextChannel, User } from "discord.js";
import { checkLink, createLink } from "../db";
import { config } from "..";
import { getId } from "../modules/mojang";
import { whitelist } from "../modules/ptero";

export default {
  category: "Interviews",
  description: "Accepts a user into the server",

  permissions: ["ADMINISTRATOR"],
  minArgs: 2,
  maxArgs: 2,
  slash: "both",
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

  callback: async ({ client, interaction: msgInt, args, message, guild }) => {
    // Get arguments from the command

    let userId = args.shift()!;
    const ign = args.shift()!;
    let user: User | undefined;

    // Gets Mojang ID of the the user
    // TODO: FIx mojang api wrapper with new library
    const mojangId = await getId(ign);

    if (!mojangId) return "Please check IGN and Try again";

    // If member role, welcome channel or interview roles arent set it will return error
    // Make a config checker to stop errors from startup
    if (
      !config.interviews.member_role ||
      !config.interviews.welcome_channel ||
      !config.interviews.interview_role
    )
      return "Please check configurations";

    if (message) {
      // Gets the user from mentions
      user = message.mentions.users?.first();
    } else {
      // Gets the user from mentions
      user = msgInt.options.getUser("user") as User;
    }

    if (!user) {
      // Sends a message to admin id the user cannot be found
      userId = userId.replace(/[<@!>]/g, "");
      return await msgInt.reply({
        content: `Could not find a user with the ID "${userId}"`,
        ephemeral: true,
      });
    }

    try {
      // Gets Member object
      const member = await guild?.members.fetch(userId);

      // Checks if user has interview role or memeber role to help prevent incorrect user acceptance
      if (
        !member?.roles.cache.has(`${config.interviews.interview_role}`) ||
        member?.roles.cache.has(`${config.interviews.member_role}`)
      ) {
        return await msgInt.reply({
          content: `Member ${user} doesnt seem to have the interview role or is already accepted to the server. Please check the member or role and try again`,
          ephemeral: true,
        });
      }
      // Gets the welcome channel
      const channel = client.channels.cache.get(
        `${config.interviews.welcome_channel}`
      );

      const id = msgInt.guild?.id;

      // White lists user
      //TODO Change to proper whitelist config
      if (id) {
        await whitelist(ign, config.pterodactyl);
      }

      // Gives user the appropriate member role
      await member?.roles.add(`${config.interviews.member_role}`);

      // Sends welcome message
      // TODO Add the ability to ping user and add welcome message
      await (channel as TextChannel).send(
        `Welcome to the server ${user}.\nIP is pinned under <#849090123038720041>`
      );

      await member?.roles.remove(`${config.interviews.interview_role}`);

      if (msgInt.guild!.id && userId) {
        const link = checkLink(mojangId);
        if (link) {
          return await msgInt.reply(
            "Link Already Exists, User has Been accepted"
          );
        }

        //  Create link with users mojang id and discord id
        createLink(mojangId, userId);

        const member = guild?.members.cache.get(userId);

        const embed = new MessageEmbed()
          .setColor("#0099ff")
          .setTitle(`Link Created and Member Accepted`)
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

        return await msgInt.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.log(error);
      return "An error has occured please try again";
    }
  },
} as ICommand;
