import {
  GuildMember,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { logger } from "../logger";
import { Response } from "../../types";
import { client, config } from "../..";

export async function postApplication(
  response: Response[],
  member: GuildMember
) {
  // Type asserted because without it the bot wont know where to send applicaitons
  const applicationChannel = (await client.channels.fetch(
    config.applications.applications_channel
  )) as TextChannel;

  if (!applicationChannel)
    return logger.error(
      `Error trying to find applications channel to send ${member} application`
    );

  const row = new MessageActionRow();

  row.addComponents(
    new MessageButton()
      .setCustomId("accept")
      .setStyle("SUCCESS")
      .setLabel("Accept")
      .setEmoji("➕")
  );
  row.addComponents(
    new MessageButton()
      .setCustomId("deny")
      .setStyle("DANGER")
      .setLabel("Deny")
      .setEmoji("➖")
  );
  row.addComponents(
    new MessageButton()
      .setCustomId("ban")
      .setStyle("SECONDARY")
      .setLabel("Ban")
      .setEmoji("⛔")
  );

  const author = {
    name: member.displayName,
    iconURL: member.user.displayAvatarURL({ dynamic: true }),
  };

  let arr = [];
  for (const entry of response) {
    const embed = new MessageEmbed()
      .setAuthor(author)
      .setColor("YELLOW")
      .setTimestamp()
      .setDescription(
        `Question# ${entry.number}\n${entry.question}\n ${entry.content}`
      );

    arr.push(embed);
  }

  var size = 5;
  var arrayOfArrays: any[] = [];
  for (var i = 0; i < arr.length; i += size) {
    arrayOfArrays.push(arr.slice(i, i + size));
  }

  let messageArray: any[] = [];
  let message: MessageEmbed[];
  //   Final Message is declared so that we can attach messages to the end of it for denying or banning memebers
  let finalMessage: Message;
  for (message of arrayOfArrays) {
    var last = arrayOfArrays[arrayOfArrays.length - 1];
    const questions = await applicationChannel.send({
      embeds: message,
      components: [],
    });
    if (message === last) {
      finalMessage = await questions.edit({ components: [row] });
    }

    messageArray.push(questions);
  }
}
