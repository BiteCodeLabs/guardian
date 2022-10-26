import { Client, Guild, TextChannel } from "discord.js";
import { config } from "..";
import { getLinks, getPlanUser, removeLink } from "../db";
import { logger } from "./logger";
import { unwhitelist } from "./ptero";

export async function msToTime(ms: number) {
  let seconds: any = (ms / 1000).toFixed(1);
  let minutes: any = (ms / (1000 * 60)).toFixed(1);
  let hours: any = (ms / (1000 * 60 * 60)).toFixed(1);
  let days: any = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
  if (seconds < 60) return seconds + " Sec";
  else if (minutes < 60) return minutes + " Min";
  else if (hours < 24) return hours + " Hrs";
  else return days + " Days";
}
// Checks for user in Plan DB if it does not exist it removes them from the database
export async function inactive(guild: Guild, client: Client) {
  try {
    logger.info("Checking for inactive users");
    const links = getLinks();

    const console = client.channels.cache.get(
      config.bot.console_channel
    ) as TextChannel;

    if (!config.bot.console_channel || !console)
      logger.warn(
        "No console channel configured or an invalid id was provided please check your config file"
      );

    if (!config.plan.inactivity.message)
      logger.warn("There is no inactivity message configured");

    if (!links) {
      logger.info("No inactive memebers found");
      return;
    }

    for (let index = 0; index < links.length; index++) {
      const user = links[index];
      const member = guild.members.cache.get(user.discord_id);

      if (!member)
        return logger.warn(`Could not get the member ${user.discord_id}`);

      if (user.grace_period > Date.now()) {
        return logger.info(
          `User ${member.displayName} is still in thier grace period skipping`
        );
      }

      if (
        !member.roles.cache.some(
          (role) => role.id === config.plan.inactivity.vaction_role
        )
      ) {
        if (getPlanUser(user.mojang_id) !== null) return;

        console.send(`Removing ${member} from server`);
        logger.info(`Removing ${member.displayName} from server`);

        await member.send(config.plan.inactivity.message);
        await guild.members.kick(member);
        await unwhitelist(user.mojang_id);
        removeLink(user.mojang_id, user.discord_id);
      }
    }
  } catch (error) {
    logger.error("Failed to remove user", error);
  }
}
