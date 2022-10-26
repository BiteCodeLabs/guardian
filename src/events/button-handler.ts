import { Client } from "discord.js";
import { logger } from "../modules/logger";

// Change to Modals for Deny and ban interactions
export default (client: Client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "apply") {
      logger.info(`${interaction.member} has used `);
    }

    interaction.message.id;
    // if (interaction.customId === "accept") {
    //   logger.info(`Accepted Member`);
    // }

    // if (interaction.customId === "deny") {
    //   logger.info(`Deny Member`);
    // }
    // if (interaction.customId === "ban") {
    //   logger.info(`Banned Member`);
    // }
  });
};
