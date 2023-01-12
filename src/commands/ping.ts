import { ICommand } from "wokcommands";

export default {
  category: "Test",
  description: "Pong ?",

  testOnly: true,
  guildOnly: true,

  callback: async ({ interaction: msgInt }) => {
    msgInt.reply("Pong");
  },
} as ICommand;
