import { config } from "..";
import logger from "../modules/logger";
import { getIGN } from "../modules/mojang";
import { unwhitelist } from "../modules/ptero";
import { Client, TextChannel } from "discord.js";
import { prisma, removeLink } from "../db";

export default (client: Client) => {
  client.on("guildMemberRemove", async (member) => {
    try {
      const consoleChannel = (await member.guild.channels.fetch(
        config.bot.console_channel
      )) as TextChannel;

      const linkMember = await prisma.links.findFirst({
        where: {
          discord_id: member.id,
        },
      });

      if (linkMember) {
        await removeLink(linkMember.id);
        const ign = await getIGN(linkMember.mojang_id);
        if (!ign) return;
        await unwhitelist(ign.name, config.pterodactyl);
        consoleChannel.send(
          `${member.displayName} has left the server, their link has been removed`
        );
      }
    } catch (error) {
      logger.error(error);
    }
  });
};
