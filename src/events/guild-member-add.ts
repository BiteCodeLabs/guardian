// import { Client } from "discord.js";
// import { checkTimeout, getConfiguration, removeTimeout, timeout } from "../db";

// import { greet, startApplication } from "../utils/application";
// import { createCollector, msToTime, sendUserMessage } from "../utils/misc";

// export default (client: Client) => {
//   client.on("guildMemberAdd", async (member) => {
//     const result = await getConfiguration(member.guild.id, 1);

//     const join_message = await getConfiguration(member.guild.id, 9);

//     if (!result || !join_message)
//       return console.log("Applications: Check your Configuration");

//     const timeoutCheck = await checkTimeout(member);

//     if (timeoutCheck && parseFloat(timeoutCheck!.timer!) > Date.now()) {
//       if (timeoutCheck!.timer === null) return;
//       const time: string = timeoutCheck!.timer;
//       const nextApply = parseFloat(time) - Date.now();
//       const waitTime = await msToTime(nextApply);

//       await member.send(`Please wait until ${waitTime} to reapply`);
//       return;
//     }

//     await removeTimeout(member);
//     await timeout(member);

//     if (result!.value !== "true") return;

//     // Used String Literal To Stop Not Assignable To String Error

//     const message = await greet(member, `${join_message!.value}`);

//     if (typeof message === undefined) return;

//     const collector = await createCollector(message!, member);

//     collector.on("collect", async (ButtonInteraction: { customId: string }) => {
//       if (!ButtonInteraction) {
//         return;
//       }

//       if (ButtonInteraction.customId === "apply") {
//         message!.delete();
//         collector.stop();
//         const content = "Application Started";
//         await sendUserMessage(member, content);
//         await startApplication(member);
//       }
//     });
//   });
// };

// export const config = {
//   displayName: "Application",
//   dbName: "Applications",
// };
