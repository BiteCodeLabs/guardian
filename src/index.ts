// Import modules needed for bot to run
import fs from "fs";
import path from "path";
import YAML from "js-yaml";
import WOKCommands from "wokcommands";
import schedule from "node-schedule";
import { Config } from "./types";
// import { inactive } from "./modules/plan";
import { logger } from "./modules/logger";
import { Client, Intents } from "discord.js";

export const config = YAML.load(
  fs.readFileSync("config/config.yml", "utf-8")
) as Config;

if (!config) {
  logger.error("No config file detected");
  process.exit(1);
}
// Import bot intents needed

export const client = new Client({
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
  ],
});

// Once the client has connected to discord this function will configure the WOK command handler

client.on("ready", async () => {
  const botGuild = await client.guilds.fetch(config.bot.server);

  if (config.plan.inactivity.enabled) {
    schedule.scheduleJob({ hour: 0, minute: 0 }, async function () {
      // await inactive(botGuild, client);
    });
  }

  client.user!.setActivity(config.bot.status, { type: "WATCHING" });

  new WOKCommands(client, {
    featureDir: path.join(__dirname, "events"),
    commandDir: path.join(__dirname, "commands"),
    testServers: [config.bot.server],
    botOwners: [config.bot.owner],
    typeScript: false,
  }).setDefaultPrefix(config.bot.prefix);
});

//Connects the client to discord

client.login(config.bot.token).then((r) => console.log("Guardian Is Alive"));
