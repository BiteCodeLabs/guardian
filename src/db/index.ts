import mysql from "mysql2";
import Keyv from "keyv";
import { logger } from "../modules/logger";
import { Database, LinkData } from "../types";

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
  const data = await linkStore.get(mojangId);
  return data as LinkData;
}

// Gets all the links from the DB
export async function getLinks() {
  return linkStore.iterator();
}

// Adds a link to the sqlite database
export async function createLink(mojangId: string, discordId: string) {
  const grace = Date.now() + 604800000;

  const link = {
    discord_id: discordId,
    grace_period: grace,
  };

  await linkStore.set(mojangId, link);
  logger.info(`Added ${mojangId}, ${link} to store`);
}
// Removes link from the table
export async function removeLink(mojang_id: string) {
  logger.info("Removing link: ", mojang_id);
  await linkStore.delete(mojang_id);
}

export async function storeApplication(messageId: string, memberId: string) {
  await interactionStore.set(messageId, memberId);
  logger.info(`Added ${messageId}, ${memberId} to store`);
}

// // Gets Plan user from database
// export function getPlanUser(mojangId: string, database: Database) {
//   //  MYSQL

//   const connection = mysql.createConnection({
//     user: database.user,
//     password: database.password,
//     host: database.host,
//     database: database.database,
//   });

//   connection.query(
//     "SELECT uuid FROM plan_users WHERE uuid=?",
//     [mojangId],
//     (err, rows) => {
//       if (err) {
//         logger.error(
//           "An error occured while trying to fetch plan users: ",
//           err
//         );
//         return;
//       }
//       return rows;
//     }
//   );
// }
