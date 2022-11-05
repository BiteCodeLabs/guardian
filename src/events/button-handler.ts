import { ButtonInteraction, Client, MessageEmbed } from "discord.js";
import { config, getGuild } from "..";
import { interactionStore } from "../db";
import { sendQuestions } from "../modules/questions";
import { logger } from "../modules/logger";
import { conductInterview } from "../modules/interview";

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
      logger.info(`${interaction.user.tag} Accepted member`);
      acceptUser(interaction);
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

async function acceptUser(interaction: ButtonInteraction) {
  try {
    const messageId = interaction.message.id;

    const data = await interactionStore.get(messageId);

    const guild = await getGuild();

    const msg = interaction.channel?.messages.cache.get(interaction.message.id);

    const member = await guild.members.fetch(data);

    if (config.interviews.enabled) {
      await conductInterview(member);
      msg?.embeds.forEach((embed: MessageEmbed) => {
        embed.setColor("GREEN");
        embed.setTimestamp();
        embed.setFooter(`User accepted by ${interaction.user.username}`);
        msg.edit({ embeds: [embed], components: [] });
      });
    } else {
      member.roles.add(config.applications.member_role);
      msg?.embeds.forEach((embed: MessageEmbed) => {
        embed.setColor("GREEN");
        embed.setTimestamp();
        embed.setFooter(`User accepted by ${interaction.user.username}`);
        msg.edit({ embeds: [embed], components: [] });
      });
    }
  } catch (error) {
    logger.error("Error trying to accept user ", error);
    return interaction.reply("There was an error trying to accept user");
  }
}

//TODO Use modals
async function denyUser(interaction: ButtonInteraction) {}
//TODO Use modals
async function banUser(interaction: ButtonInteraction) {}
