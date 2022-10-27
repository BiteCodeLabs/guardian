import mysql from "mysql2";
import sqlite from "sqlite3";
import { ApplicationCache, Database, Link } from "../types";
import { logger } from "../modules/logger";

// SQLITE

// Creates a database and then execute create table query
const db = new sqlite.Database("db.sqlite");

export function initDB() {
  db.exec(
    "CREATE TABLE IF NOT EXISTS applications_cache (message_id VARCHAR(18) PRIMARY KEY,member_id VARCHAR(18))"
  );

  db.exec(
    "CREATE TABLE IF NOT EXISTS links (mojang_id VARCHAR(36) PRIMARY KEY, discord_id VARCHAR(18), grace_period INTEGER)"
  );
}

// Checks the link of a given user
export function checkLink(mojangId: string) {
  try {
    const query = db
      .prepare("SELECT * FROM links WHERE mojang_id=?")
      .get(mojangId);
    return query as unknown as Link;
  } catch (error) {
    logger.error("Error trying to get link: ", error);
  }
}

// Gets all the links from the DB
export function getLinks() {
  try {
    const query = db.prepare("SELECT * FROM links");
    return query as unknown as Link[];
  } catch (error) {
    logger.error("Error trying to get link: ", error);
  }
}

// Adds a link to the sqlite database
export function createLink(mojang_id: string, discord_id: string) {
  const grace = Date.now() + 604800000;
  // This is done to protect against sql injections see https://github.com/TryGhost/node-sqlite3/issues/57
  try {
    const data = db.prepare(
      "INSERT INTO links VALUES(mojang_id=?, discord_id=?,grace_period=?)",
      mojang_id,
      discord_id,
      grace
    );
    logger.info(`Added ${data} to links database`);
  } catch (error) {
    logger.error("Error trying to add link to database", error);
  }
}

// Removes link from the table
export function removeLink(mojang_id: string, discord_id: string) {
  // This is done to protect against sql injections see https://github.com/TryGhost/node-sqlite3/issues/57
  try {
    const data = db.prepare(
      "DELETE FROM links WHERE mojang_id=? AND discord_id=?",
      mojang_id,
      discord_id
    );
    logger.info(`Removed ${data} from links database`);
  } catch (error) {
    logger.error("Error trying to remove link from database: ", error);
  }
}

export function getApplication(message_id: string) {
  try {
    const data = db
      .prepare("SELECT * FROM application_cache WHERE message_id=?")
      .get(message_id);

    return data as unknown as ApplicationCache;
  } catch (error) {
    logger.error(
      "Error trying to get applicaiton cache from database: ",
      error
    );
  }
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
