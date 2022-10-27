// import { AnyChannel, Client, TextChannel } from "discord.js";
// import { getConfiguration, prisma, removeLink } from "../db";
// import { consoleMessage, getIGN, unwhitelist } from "../utils/misc";

// export default (client: Client) => {
//   client.on("guildMemberRemove", async (member) => {
//     try {
//       let consoleChannel: TextChannel;
//       const link = await prisma.link.findMany({
//         where: {
//           guild_id: member.guild.id,
//           discord_id: member.id,
//         },
//       });

//       const config = await getConfiguration(member.guild.id, 15);

//       if (link.length === 0) return;

//       if (config?.value !== null) {
//         consoleChannel = client.channels.cache.get(
//           config!.value
//         ) as TextChannel;
//       } else {
//         return;
//       }

//       link.forEach(
//         async (element: {
//           mojang_uuid: string;
//           guild_id: string;
//           discord_id: string;
//         }) => {
//           const ign = await getIGN(element.mojang_uuid);
//           await consoleMessage(
//             consoleChannel,
//             `${member} has left the server removing ${ign} form servers`
//           );
//           await unwhitelist(element.guild_id, ign);
//           await removeLink(
//             element.guild_id,
//             element.mojang_uuid,
//             element.discord_id
//           );
//         }
//       );
//     } catch (error) {
//       console.log(error);
//     }
//   });
// };
