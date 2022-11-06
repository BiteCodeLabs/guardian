import {
  ButtonInteraction,
  Client,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { config, guild } from "..";
import { interactionStore, timeoutCache } from "../db";
import { sendQuestions } from "../modules/questions";
import { logger } from "../modules/logger";
import { conductInterview } from "../modules/interview";

// Change to Modals for Deny and ban interactions
// TODO Store data in database and then implement logic to get that data to use in interview creation

export default (client: Client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "apply") {
      // TODO Add timeout
      logger.info(`${interaction.member} has used the apply button`);

      const checkTimeout = await timeoutCache.get(interaction.user.id);

      if (!checkTimeout) {
        const member = interaction.guild?.members.cache.get(
          interaction.user.id
        );
        if (member) sendQuestions(member);
        await timeoutCache.set(
          interaction.user.id,
          true,
          config.applications.timeout * 60000
        );
      } else {
        interaction.reply({
          content: `Please wait for ${config.applications.timeout} minutes after your application to apply again thank you`,
          ephemeral: true,
        });
      }
    }

    if (interaction.customId === "accept") {
      logger.info(`${interaction.user.tag} accepted member`);
      acceptUser(interaction);
    }

    if (interaction.customId === "deny") {
      try {
        logger.info(`${interaction.user.tag} denied member`);

        denyUser(interaction);
      } catch (error) {
        logger.error("Error trying to accept user");
      }
    }

    if (interaction.customId === "ban") {
      try {
        logger.info(`${interaction.user.tag} banned member`);

        banUser(interaction);
      } catch (error) {
        logger.error("Error trying to accept user");
      }
    }
  });
};

async function acceptUser(interaction: ButtonInteraction) {
  try {
    const data = await interactionStore.get(interaction!.message.id);

    const server = await guild;

    const member = await server.members.fetch(data);

    const channel = (await server.channels.fetch(
      config.applications.applications_channel
    )) as TextChannel;

    const msg = await channel.messages.fetch(interaction.message.id);

    if (config.interviews.enabled) {
      await conductInterview(member);
      msg?.embeds.forEach((embed: MessageEmbed) => {
        embed.setColor("GREEN");
        embed.setTimestamp();
        embed.setFooter(`User accepted by ${interaction.user.username}`);
        msg.edit({ embeds: [embed], components: [] });
      });
    } else {
      // TODO Add Prompt for IGN
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

async function denyUser(interaction: ButtonInteraction) {
  try {
    const data = await interactionStore.get(interaction.message.id);

    const server = await guild;

    const member = await server.members.fetch(data);

    const channel = (await server.channels.fetch(
      config.applications.applications_channel
    )) as TextChannel;

    const msg = await channel.messages.fetch(interaction.message.id);

    const denyEmbed = new MessageEmbed().setTitle(
      "Please input your reason for denying this application"
    );
    const cancelButton = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("cancel")
        .setStyle("DANGER")
        .setLabel("Cancel")
    );

    const reason = await msg.reply({
      embeds: [denyEmbed],
      components: [cancelButton],
    });

    const messageFilter = (m: Message) => {
      return m.author.id === interaction.user.id;
    };

    const messageCollector = interaction.channel!.createMessageCollector({
      filter: messageFilter,
      max: 1,
    });

    const buttonFilter = (b: MessageComponentInteraction) => {
      return b.user.id === interaction.user.id;
    };

    const buttonCollector =
      interaction.channel!.createMessageComponentCollector({
        filter: buttonFilter,
      });

    buttonCollector.on("collect", async (interaction) => {
      if (interaction.message.id !== reason.id) return;
      buttonCollector.dispose(interaction);
      await reason.delete();
      return;
    });

    messageCollector.on("collect", async (message: Message) => {
      if (interaction.message.id !== reason.id) return;
      await message.delete();
      messageCollector.stop("answered");
    });

    messageCollector.on("end", async (collected) => {
      const response = collected.first()?.content;
      await reason.delete();
      msg?.embeds.forEach((embed: MessageEmbed) => {
        embed.setColor("ORANGE");
        embed.setTimestamp();
        embed.setFooter({
          text: `User Denied by ${interaction.user.username}\nReason: ${response}\n`,
        });
        msg.edit({ embeds: [embed], components: [] });
      });

      const reasonEmbed = new MessageEmbed()
        .setTitle("Better Luck Next Time!")
        .setColor("ORANGE")
        .addFields({ name: "Reason", value: `${response}` })
        .setFooter(`You can reapply in ${config.applications.timeout} minutes`);

      await member.send({
        embeds: [reasonEmbed],
      });
    });
  } catch (error) {
    logger.error("An error occured when trying to deny user: ", error);
  }
}

async function banUser(interaction: ButtonInteraction) {
  try {
    const data = await interactionStore.get(interaction.message.id);

    const server = await guild;

    const member = await server.members.fetch(data);

    const channel = (await server.channels.fetch(
      config.applications.applications_channel
    )) as TextChannel;

    const msg = await channel.messages.fetch(interaction.message.id);

    const banEmbed = new MessageEmbed().setTitle(
      "Please input your reason for banning this applicatant"
    );
    const cancelButton = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId("cancel")
        .setStyle("DANGER")
        .setLabel("Cancel")
    );

    const reason = await msg.reply({
      embeds: [banEmbed],
      components: [cancelButton],
    });

    const messageFilter = (m: Message) => {
      return m.author.id === interaction.user.id;
    };

    const messageCollector = interaction.channel!.createMessageCollector({
      filter: messageFilter,
      max: 1,
    });

    const buttonFilter = (b: MessageComponentInteraction) => {
      return b.user.id === interaction.user.id;
    };

    const buttonCollector =
      interaction.channel!.createMessageComponentCollector({
        filter: buttonFilter,
      });

    buttonCollector.on("collect", async (interaction) => {
      if (interaction.message.id !== reason.id) return;
      await reason.delete();
      return;
    });

    messageCollector.on("collect", async (message: Message) => {
      if (interaction.message.id !== reason.id) return;
      await message.delete();
      messageCollector.stop("answered");
    });

    messageCollector.on("end", async (collected) => {
      const response = collected.first()?.content;

      await reason.delete();
      msg?.embeds.forEach((embed: MessageEmbed) => {
        embed.setColor("RED");
        embed.setTimestamp();
        embed.setFooter({
          text: `User Banned by ${interaction.user.username}\nReason: ${response}\n`,
        });
        msg.edit({ embeds: [embed], components: [] });
      });

      const reasonEmbed = new MessageEmbed()
        .setTitle("You were banned")
        .setColor("RED")
        .addFields({ name: "Reason", value: `${response}` });

      await member.send({
        embeds: [reasonEmbed],
      });
      await member.ban({
        reason: response,
      });
    });
  } catch (error) {
    logger.error("An error occured when trying to ban user: ", error);
  }
}
