import {
  GuildMember,
  InteractionCollector,
  Message,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { client } from "..";

export async function acceptMember(
  application: Message[],
  adminInteraction: MessageComponentInteraction
) {
  application.forEach(async (element: Message) => {
    let newEmbeds: MessageEmbed[] = [];

    element.embeds.forEach((e) => {
      let newEmbed = e.setColor("GREEN").setFooter({
        text: `User accepted by ${adminInteraction.user.username}`,
      });
      newEmbeds.push(newEmbed);
    });

    await element.edit({ embeds: newEmbeds, components: [] });
  });
}

export async function denyMember(
  application: Message[],
  adminInteraction: MessageComponentInteraction,
  member: GuildMember,
  appId: number,
  collect: InteractionCollector<MessageComponentInteraction>,
  state: string,
  finalMessage: Message
) {
  try {
    const denyEmbed = new MessageEmbed().setTitle(
      "Please input your reason for denying this application"
    );

    const button = new MessageActionRow();

    button.addComponents(
      new MessageButton()
        .setCustomId("cancel")
        .setStyle("DANGER")
        .setLabel("Cancel")
    );

    const reason = await finalMessage.reply({
      embeds: [denyEmbed],
      components: [button],
    });

    const { channel } = reason;

    const buttonCollector = channel.createMessageComponentCollector();

    const messageCollector = channel.createMessageCollector();

    buttonCollector.on("collect", async (interaction) => {
      if (interaction.message.id !== reason.id) return;
      await reason.delete();
      messageCollector.stop("Cancelled");
      return;
    });

    messageCollector.on("collect", (message: Message) => {
      if (message.author === adminInteraction.user) {
        message.delete();
        reason.delete();
        collect.stop("Application Answered");
        messageCollector.stop("answered");
      }
    });

    messageCollector.on("end", async (collected) => {
      const response = collected.map((msg) => {
        return msg.content;
      });

      if (response.toString() === "") return;

      application.forEach(async (element: Message) => {
        let newEmbeds: MessageEmbed[] = [];

        element.embeds.forEach((e) => {
          let newEmbed = e.setColor("ORANGE");
          e.setFooter({
            text: `User Denied by ${adminInteraction.user.username}\nReason: ${response}\n`,
          });
          newEmbeds.push(newEmbed);
        });

        await element.edit({ embeds: newEmbeds, components: [] });
      });

      // await storeResponse(application.guild!, appId, adminInteraction.user.id, state, response.toString())

      const reasonEmbed = new MessageEmbed()
        .setTitle("Better Luck Next Time!")
        .setColor("ORANGE")
        .addFields({ name: "Reason", value: `${response}` });

      await member.send({ embeds: [reasonEmbed] });
      await member.send("You can reapply in 5 minutes with the command /apply");
    });
  } catch (error) {}
}

export async function banMember(
  application: Message[],
  adminInteraction: MessageComponentInteraction,
  member: GuildMember,
  appId: number,
  collect: InteractionCollector<MessageComponentInteraction>,
  state: string,
  finalMessage: Message
) {
  try {
    if (!member.bannable) {
      const unBannable = new MessageEmbed().setTitle(
        "The user cannot be banned"
      );

      return finalMessage.reply({ embeds: [unBannable] }).then((r) => {
        setTimeout(() => r.delete(), 5000);
      });
    }

    const banEmbed = new MessageEmbed().setTitle(
      "Please input your reason for banning this user"
    );

    const button = new MessageActionRow();

    button.addComponents(
      new MessageButton()
        .setCustomId("cancel")
        .setStyle("DANGER")
        .setLabel("Cancel")
    );

    const reason = await finalMessage.reply({
      embeds: [banEmbed],
      components: [button],
    });

    const { channel } = reason;

    const buttonCollector = channel.createMessageComponentCollector();

    const messageCollector = channel.createMessageCollector();

    buttonCollector.on("collect", async (interaction) => {
      interaction.deferUpdate();

      if (interaction.message.id !== reason.id) return;
      await reason.delete();
      messageCollector.stop("Cancelled");
      return;
    });

    messageCollector.on("collect", async (message: Message) => {
      if (message.author === adminInteraction.user) {
        await message.delete();
        await reason.delete();
        collect.stop("Application Answered");
        messageCollector.stop("answered");
      }
    });

    messageCollector.on("end", async (collected) => {
      const response = collected.map((msg) => {
        const { content } = msg;
        return content.toString();
      });

      if (response.toString() === "") return;

      application.forEach(async (element: Message) => {
        let newEmbeds: MessageEmbed[] = [];

        element.embeds.forEach((e) => {
          let newEmbed = e.setColor("RED");
          e.setFooter({
            text: `User Banned by ${adminInteraction.user.username}\nReason: ${response}\n`,
          });
          newEmbeds.push(newEmbed);
        });

        await element.edit({ embeds: newEmbeds, components: [] });
      });

      const reasonEmbed = new MessageEmbed()
        .setTitle(`You have been banned from ${member.guild.name}`)
        .addFields({ name: "Reason", value: `${response.toString()}` })
        .setColor("RED");

      await member.send({ embeds: [reasonEmbed] });

      await member.ban({
        reason: response.toString(),
      });
    });
  } catch (error) {
    console.log(error);
  }
}
