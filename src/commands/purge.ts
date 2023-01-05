import { ICommand } from "wokcommands";
import { inactive } from "../modules/plan";
import { client } from "../index";

export default {
  category: "Inactivity",
  description: "Removes inactive users from discord",

  permissions: ["ADMINISTRATOR"],
  slash: "both",
  guildOnly: true,

  callback: async ({ guild }) => {
    if (!guild) return;
    await inactive(guild, client);
  },
} as ICommand;
