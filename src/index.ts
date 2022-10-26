// Import modules needed for bot to run
import fs from "fs";
import path from "path";
import YAML from "js-yaml";
import Inactive from "./utils/plan";
import WOKCommands from "wokcommands";
import schedule from "node-schedule";
import { Client, Intents } from "discord.js";

import { Config } from "./types";

export const config = YAML.load(
  fs.readFileSync("config.yml", "utf-8")
) as Config;

if (!config) {
  console.log("No config file detected");
  process.exit(1);
}

console.log(config.applications.questions);

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
  schedule.scheduleJob({ hour: 0, minute: 0 }, async function () {
    const message = "Running Daily Check";
    console.log(message);
    await Inactive(client);
  });

  client.user!.setActivity(config.bot.status, { type: "WATCHING" });

  new WOKCommands(client, {
    featureDir: path.join(__dirname, "events"),
    commandDir: path.join(__dirname, "commands"),
    testServers: config.bot.test_server,
    botOwners: [config.bot.owner],
    typeScript: false,
  }).setDefaultPrefix(config.bot.prefix);
});

//Connects the client to discord

client.login(config.bot.token).then((r) => console.log("Guardian Is Alive"));
