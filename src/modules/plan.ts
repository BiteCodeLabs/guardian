import mysql from "mysql2";
import { config } from "..";
import logger from "./logger";
import { MySQLData } from "../types";
import { linkStore, removeLink } from "../db";
import { Client, Guild, TextChannel } from "discord.js";

// Checks for user in Plan DB if it does not exist it removes them from the database
export async function inactive(guild: Guild, client: Client) {
  try {
    logger.info("Checking for inactive users");
    const consoleChannel = client.channels.cache.get(
      config.bot.console_channel
    ) as TextChannel;

    if (!config.bot.console_channel || !console)
      logger.warn(
        "No console channel configured or an invalid id was provided please check your config file"
      );

    if (!config.plan.inactivity.message)
      logger.warn("There is no inactivity message configured");

    for await (const [key, value] of linkStore.iterator()) {
      const member = guild.members.cache.get(value);
      if (!member) return logger.warn(`Could not get the member ${value}`);

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
        try {
          const db = mysql.createConnection({
            host: config.plan.database.host,
            user: config.plan.database.user,
            database: config.plan.database.database,
            password: config.plan.database.password,
            port: parseInt(config.plan.database.port),
            connectionLimit: 5,
          });

          db.query(
            "SELECT * FROM `plan_users` WHERE `uuid` = ?",
            [key],
            async function (err, rows) {
              if (err) {
                return logger.error(err);
              }
              const data = rows as unknown as MySQLData[];
              if (data.length === 0) {
                consoleChannel.send(`Removing ${member} from server`);
                logger.error(`Removing ${member.displayName} from server`);
                await member.send(config.plan.inactivity.message);
                await guild.members.kick(member);
                await removeLink(key);

                if (!config.pterodactyl) {
                  logger.warn(
                    "Pterodactyl module has not been enabled or is missing from your config file"
                  );
                  return "Pterodactyl module has not been enabled or is missing from your config file";
                }
              }
              return;
            }
          );
        } catch (error) {
          console.error("Error trying to get plan user data", error);
        }
      }
    }
  } catch (error) {
    logger.error("Failed to remove user", error);
  }
}
