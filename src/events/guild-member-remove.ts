import { config } from "..";
import logger from "../modules/logger";
import { getIGN } from "../modules/mojang";
import { checkLink, removeLink } from "../db";
import { unwhitelist } from "../modules/ptero";
import { Client, TextChannel } from "discord.js";

export default (client: Client) => {
  client.on("guildMemberRemove", async (member) => {
    try {
      const consoleChannel = (await member.guild.channels.fetch(
        config.bot.console_channel
      )) as TextChannel;

      const link = await checkLink(member.id);

      if (link) {
        await removeLink(member.id);
        const ign = await getIGN(link.mojangId);
        if (!ign) return;
        await unwhitelist(ign.name, config.pterodactyl);
        consoleChannel.send(
          `${member.displayName} has left the server, thier link has been removed`
        );
      } else consoleChannel.send("Link not found moving on");
    } catch (error) {
      logger.error(error);
    }
  });
};
