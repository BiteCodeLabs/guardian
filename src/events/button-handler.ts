import { Client, MessageEmbed } from "discord.js";
import { config, getGuild } from "..";
import { interactionStore } from "../db";
import { acceptMember } from "../modules/applications/accept";
import { sendQuestions } from "../modules/applications/questions";
import { logger } from "../modules/logger";

// Change to Modals for Deny and ban interactions
// TODO Store data in database and then implement logic to get that data to use in interview creation

export default (client: Client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "apply") {
      logger.info(`${interaction.member} has used the apply button`);

      const member = interaction.guild?.members.cache.get(interaction.user.id);
      if (member) sendQuestions(member);
    }

    if (interaction.customId === "accept") {
      try {
        logger.info(`Accepted Member`);

        const messageId = interaction.message.id;

        const data: string = await interactionStore.get(messageId);

        const guild = await getGuild();

        const msg = interaction.channel?.messages.cache.get(
          interaction.message.id
        );

        const member = await guild.members.fetch(data);

        if (!data) {
          logger.error(
            "There was an error getting application data for ",
            messageId
          );
          return interaction.reply(
            `There was an error getting application data for ${messageId} `
          );
        }

        if (!member) {
          logger.error(
            "There was an error getting application data for ",
            messageId
          );
          return interaction.reply(
            `There was an error getting application data for ${messageId} `
          );
        }

        acceptMember(member, config);

        msg?.embeds.forEach((embed) => {
          embed.setColor("GREEN");
          embed.setTimestamp();
          embed.setFooter(`User accepted by ${interaction.user.username}`);
          msg.edit({ embeds: [embed], components: [] });
        });
      } catch (error) {
        logger.error("Error trying to accept user");
        return interaction.reply("There was an error trying to accept user");
      }
    }

    if (interaction.customId === "deny") {
      try {
        logger.info(`Deny Member`);

        const member = interaction.guild?.members.cache.get(
          interaction.user.id
        );
      } catch (error) {
        logger.error("Error trying to accept user");
      }
    }

    if (interaction.customId === "ban") {
      try {
        logger.info(`Banned Member`);

        const member = interaction.guild?.members.cache.get(
          interaction.user.id
        );
      } catch (error) {
        logger.error("Error trying to accept user");
      }
    }
  });
};
