import { Client } from "discord.js";
import { config } from "..";
import { acceptMember } from "../modules/applications/accept";
import { sendQuestions } from "../modules/applications/questions";
import { logger } from "../modules/logger";

// Change to Modals for Deny and ban interactions
// TODO Store data in database and then implement logic to get that data to use in interview creation

export default (client: Client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "apply") {
      logger.info(`${interaction.member} has used `);

      const member = interaction.guild?.members.cache.get(interaction.user.id);
      sendQuestions(member!);
    }

    if (interaction.customId === "accept") {
      try {
        logger.info(`Accepted Member`);

        const member = interaction.guild?.members.cache.get(
          interaction.user.id
        );

        acceptMember(member!, config);
      } catch (error) {
        logger.error("Error trying to accept user");
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
