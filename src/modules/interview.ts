import logger from "./logger";
import { client, config } from "..";
import { GuildMember, TextChannel } from "discord.js";

const { interviews } = config;

export async function conductInterview(member: GuildMember) {
  try {
    if (
      !interviews.interview_channel ||
      !interviews.interview_role ||
      !interviews.notification
    )
      return logger.error("Please check configurations");

    await member.roles.add(interviews.interview_role);

    const interviewChannel = client.channels.cache.get(
      interviews.interview_channel
    );

    const { displayName } = member;

    const thread = await (interviewChannel as TextChannel).threads.create({
      name: displayName,
    });

    await thread.members.add(member);

    await thread.join();

    await thread.send(interviews.notification);
  } catch (error) {
    return logger.error(
      "Error setting up interviews please check your configurations and retry: ",
      error
    );
  }
}
