import path from "path";
import WOK from "wokcommands";
import { config } from "dotenv";
import io from "socket.io-client";
import logger from "./modules/logger";
import { Client, Intents } from "discord.js";
import { BanUserEvent } from "./types";

config();

type EventMessage = {
  msg: string;
};

const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_OWNER = process.env.BOT_OWNER;
const BOT_TEST_SERVER = process.env.BOT_TEST_SERVER;
const MONGO_URI = process.env.MONGO_URI;

export const client = new Client({
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
  ],
});

client.on("ready", async () => {
  new WOK(client, {
    commandDir: path.join(__dirname, "commands"),
    testServers: "1048676975897739386",
    botOwners: "203121159393247232",
    mongoUri: MONGO_URI,
    typeScript: true,
  });

  const socket = io("http://localhost:3000");

  // client-side
  socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
  });

  socket.on("test", (event: BanUserEvent) => {
    console.log(event);
  });

  socket.on("disconnect", () => {
    console.log(socket.id); // undefined
  });
});

client.login(BOT_TOKEN).then((r) => logger.info("Guardian Is Alive"));
