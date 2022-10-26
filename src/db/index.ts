import fs from "node:fs";
import mysql from "mysql2";
import { config } from "..";
import sqlite from "sqlite3";
import { ApplicationCache, Link } from "../types";
import { logger } from "../modules/logger";

// SQLITE

// Creates a database and then execute create table query
const db = new sqlite.Database("db.sqlite");

db.exec(fs.readFileSync("/sql/create-tables.sql").toString());

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

//  MYSQL

const dbConfig = config.plan.database;

const connection = mysql.createConnection({
  user: dbConfig.user,
  password: dbConfig.password,
  host: dbConfig.host,
  database: dbConfig.database,
});

// Gets Plan user from database
export function getPlanUser(mojangId: string) {
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
