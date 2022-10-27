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

  var embed = new MessageEmbed()
    .setColor("YELLOW")
    .setAuthor(author)
    .setTitle(`${member.user} has submitted an application`)
    .setThumbnail(
      member.displayAvatarURL({
        dynamic: true,
      })
    )
    .setTimestamp();

  // Solution is from https://github.com/Milrato-Development/Easiest-Application go check them out >.>
  try {
    for (var i = 0; i < response.length; i++) {
      let qu = response[i].question;
      if (qu.length > 100) qu = response[i].question.substring(0, 100) + " ...";
      embed.addField(
        qu.substring(0, 256),
        ">>> " + response[i].content.substring(0, 1000)
      );
    }

    applicationChannel.send({
      embeds: [embed],
      components: [row],
    });
  } catch (error) {
    logger.error(
      `Error while submitting user application ${response}: \n`,
      error
    );
  }
}
