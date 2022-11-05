import { config } from "..";
import { logger } from "./logger";
import { unwhitelist } from "./ptero";
import { Client, Guild, TextChannel } from "discord.js";
import { getPlanUser, linkStore, removeLink } from "../db";

// export async function msToTime(ms: number) {
//   let seconds: any = (ms / 1000).toFixed(1);
//   let minutes: any = (ms / (1000 * 60)).toFixed(1);
//   let hours: any = (ms / (1000 * 60 * 60)).toFixed(1);
//   let days: any = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
//   if (seconds < 60) return seconds + " Sec";
//   else if (minutes < 60) return minutes + " Min";
//   else if (hours < 24) return hours + " Hrs";
//   else return days + " Days";
// }
// Checks for user in Plan DB if it does not exist it removes them from the database
export async function inactive(guild: Guild, client: Client) {
  try {
    logger.info("Checking for inactive users");
    const console = client.channels.cache.get(
      config.bot.console_channel
    ) as TextChannel;

    if (!config.bot.console_channel || !console)
      logger.warn(
        "No console channel configured or an invalid id was provided please check your config file"
      );

    if (!config.plan.inactivity.message)
      logger.warn("There is no inactivity message configured");

    for await (const [key, value] of linkStore.iterator()) {
      const member = guild.members.cache.get(key);
      if (!member) return logger.warn(`Could not get the member ${key}`);

      if (value.gracePeriod > Date.now()) {
        return logger.info(
          `User ${member.displayName} is still in thier grace period skipping`
        );
      }
      if (
        !member.roles.cache.some(
          (role: { id: string }) =>
            role.id === config.plan.inactivity.vaction_role
        )
      ) {
        await getPlanUser(value.mojangId);
        console.send(`Removing ${member} from server`);
        logger.info(`Removing ${member.displayName} from server`);
        await member.send(config.plan.inactivity.message);
        await guild.members.kick(member);
        await removeLink(member.id);

        if (!config.pterodactyl) {
          logger.warn(
            "Pterodactyl module has not been enabled or is missing from your config file"
          );
          return "Pterodactyl module has not been enabled or is missing from your config file";
        }
      }
    }
  } catch (error) {
    logger.error("Failed to remove user", error);
  }
}
