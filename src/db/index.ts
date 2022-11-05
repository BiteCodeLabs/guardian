import Keyv from "keyv";
import mysql from "mysql2";
import { logger } from "../modules/logger";
import tables from "@databases/mysql-typed";
import { Database, LinkData } from "../types";
import createConnection, { sql } from "@databases/mysql";
import DatabaseSchema, { serializeValue } from "../__generated__";
import { config } from "..";

export const linkStore = new Keyv("sqlite://database.sqlite", {
  table: "link_store",
  busyTimeout: 10000,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

export const interactionStore = new Keyv("sqlite://database.sqlite", {
  table: "interaction_store",
  busyTimeout: 10000,
  serialize: JSON.stringify,
  deserialize: JSON.parse,
});

linkStore.on("error", (err: any) => {
  logger.error(
    "Connection Error while trying to connect to links sqlite store",
    err
  );
  process.exit(1);
});

interactionStore.on("error", (err: any) => {
  logger.error(
    "Connection Error while trying to connect to interactions sqlite store",
    err
  );
  process.exit(1);
});

// Checks the link of a given user
export async function checkLink(discordId: string) {
  const data = await linkStore.get(discordId);
  return data as LinkData;
}

// Gets all the links from the DB
export async function getLinks() {
  return linkStore.iterator();
}

// Adds a link to the sqlite database
export async function createLink(discordId: string, mojangId: string) {
  const grace = Date.now() + 604800000;

  const link = {
    mojangId: mojangId,
    gracePeriod: grace,
  };

  await linkStore.set(discordId, link);
  logger.info(`Added ${discordId}, ${link.mojangId} to store`);

  console.log(await linkStore.get(discordId));
}
// Removes link from the table
export async function removeLink(discordId: string) {
  logger.info("Removing link: ", discordId);
  await linkStore.delete(discordId);
}

export async function storeApplication(messageId: string, memberId: string) {
  await interactionStore.set(messageId, memberId);
  logger.info(`Added ${messageId}, ${memberId} to store`);
}

// // Gets Plan user from database

export async function getPlanUser(uuid: string) {
  try {
    const db = createConnection(
      `mysql://${config.plan.database.user}:${config.plan.database.password}@${config.plan.database.host}:${config.plan.database.port}/${config.plan.database.database}`
    );

    const { plan_users } = tables<DatabaseSchema>({
      serializeValue,
    });

    const data = await plan_users(db).findOne({
      uuid: uuid,
    });
    return data;
  } catch (error) {
    logger.error("Error trying to get plan user data", error);
  }
}
