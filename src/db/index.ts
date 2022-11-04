import mysql from "mysql2";
import Keyv from "@keyvhq/core";
import KeyvRedis from "@keyvhq/redis";
import { logger } from "../modules/logger";
import { Database, LinkData } from "../types";

export const linkStore = new Keyv({
  store: new KeyvRedis("redis://localhost:6379"),
  namespace: "links",
});

export const interactionStore = new Keyv({
  store: new KeyvRedis("redis://localhost:6379"),
  namespace: "links",
});

linkStore.on("error", (err) => {
  logger.error(
    "Connection Error while trying to connect to links redis store",
    err
  );
  process.exit(1);
});

interactionStore.on("error", (err) => {
  logger.error(
    "Connection Error while trying to connect to interactions redis store",
    err
  );
  process.exit(1);
});

// Checks the link of a given user
export async function checkLink(mojangId: string) {
  return await linkStore.get(mojangId);
}

// Gets all the links from the DB
export async function getLinks() {
  return linkStore.iterator();
}

// Adds a link to the sqlite database
export async function createLink(mojangId: string, discordId: string) {
  const grace = Date.now() + 604800000;

  const link: LinkData = {
    discord_id: discordId,
    grace_period: grace,
  };

  const data = JSON.stringify(link);

  await linkStore.set(mojangId, data);
  logger.info(`Added ${mojangId}, ${data} to store`);
}
// Removes link from the table
export async function removeLink(mojang_id: string) {
  logger.info("Removing link: ", mojang_id);
  return await linkStore.delete(mojang_id);
}

export function storeApplication(messageId: string, memberId: string) {
  logger.info(`Added ${messageId}, ${memberId} to store`);
}

export async function getApplication(messageId: string) {
  return await linkStore.get(messageId);
}

// Gets Plan user from database
export function getPlanUser(mojangId: string, database: Database) {
  //  MYSQL

  const connection = mysql.createConnection({
    user: database.user,
    password: database.password,
    host: database.host,
    database: database.database,
  });

  connection.query(
    "SELECT uuid FROM plan_users WHERE uuid=?",
    [mojangId],
    (err, rows) => {
      if (err) {
        logger.error(
          "An error occured while trying to fetch plan users: ",
          err
        );
        return;
      }
      return rows;
    }
  );
}
