import { GuildMember, TextChannel } from "discord.js";
import { client, config } from "../..";
import { logger } from "../logger";
import { conductInterview } from "./interview";

export async function acceptMember(member: GuildMember) {
  const { applications, interviews } = config;
  if (interviews.enabled) {
    return conductInterview(member);
  }

  try {
    if (
      !applications.member_role ||
      !applications.welcome_channel ||
      !applications.welcome_message
    )
      return logger.error("Please check configurations");

    await member.roles.add(`${applications.member_role}`);

    const welcomeChannel = client.channels.cache.get(
      applications.welcome_channel
    ) as TextChannel;

    return welcomeChannel.send(applications.welcome_message);
  } catch (error) {
    return logger.error(
      "Could not accept user check your application configuration and try again: ",
      error
    );
  }
}
