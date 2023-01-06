import { config } from "..";
import logger from "./logger";
import { prisma, removeLink } from "../db";
import { Client, Guild, TextChannel } from "discord.js";

// Checks for user in Plan DB if it does not exist it removes them from the database
export async function inactive(guild: Guild, client: Client) {
  if (!config.pterodactyl) {
    logger.error(
      "Pterodactyl module has not been enabled or is missing from your config file"
    );
    return "Pterodactyl module has not been enabled or is missing from your config file";
  }

  logger.info("Checking for inactive users");

  try {
    const consoleChannel = client.channels.cache.get(
      config.bot.console_channel
    ) as TextChannel;

    if (!config.bot.console_channel || !console)
      logger.warn(
        "No console channel configured or an invalid id was provided please check your config file"
      );

    if (!config.plan.inactivity.message)
      logger.warn("There is no inactivity message configured");

    const allLinks = await prisma.links.findMany();

    allLinks.forEach(async (element) => {
      const user = await prisma.plan_users.findFirst({
        where: {
          uuid: element.mojang_id,
        },
      });
      if (user) return;

      try {
        const member = await guild.members.fetch(element.discord_id);

        if (element.gracePeriod > Date.now())
          return logger.info(
            `User ${member.displayName} is still in their grace period skipping`
          );

        if (
          !member.roles.cache.some(
            (role) => role.id === config.plan.inactivity.vaction_role
          )
        ) {
          consoleChannel.send(`Removing ${member} from server`);
          logger.info(`Removing ${member.displayName} from server`);
          await member.send(config.plan.inactivity.message);
          await guild.members.kick(member);
          await removeLink(element.id);
        }
      } catch (error) {
        logger.error(error);
        logger.error("Could not find user with id", element.mojang_id);
        await prisma.links.delete({
          where: { id: element.id },
        });
      }
    });
  } catch (error) {
    logger.error("An error occured when trying to remove users", error);
  }
}
