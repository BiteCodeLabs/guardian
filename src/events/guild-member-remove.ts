import { config } from "..";
import logger from "../modules/logger";
import { getIGN } from "../modules/mojang";
import { linkStore, removeLink } from "../db";
import { unwhitelist } from "../modules/ptero";
import { Client, TextChannel } from "discord.js";

export default (client: Client) => {
  client.on("guildMemberRemove", async (member) => {
    try {
      const consoleChannel = (await member.guild.channels.fetch(
        config.bot.console_channel
      )) as TextChannel;

      for await (const [key, value] of linkStore.iterator()) {
        if (value.discordId === member.id) {
          await removeLink(key);
          const ign = await getIGN(key);
          if (!ign) return;
          await unwhitelist(ign.name, config.pterodactyl);
          consoleChannel.send(
            `${member.displayName} has left the server, their link has been removed`
          );
        }
      }
    } catch (error) {
      logger.error(error);
    }
  });
};
