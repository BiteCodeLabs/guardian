import { config } from "../..";
import { logger } from "../logger";
import { GuildMember, Message, MessageEmbed } from "discord.js";

// Change to Modal System
export async function sendQuestions(member: GuildMember) {
  try {
    const questions = config.applications.questions;

    if (!questions) {
      return logger.error("No application questions configured");
    }

    const filter = (m: Message) => m.author.id === member.id;

    let count = 1;
    let index = 0;

    const embed = new MessageEmbed()
      .setTitle(`Question: ${count++}`)
      .setDescription(`${questions[index++]}`)
      .setColor("AQUA")
      .setTimestamp();

    const { channel } = await member.send({ embeds: [embed] });

    const collector = channel.createMessageCollector({ filter });

    collector.on("collect", () => {
      if (index < questions.length) {
        const embed = new MessageEmbed()
          .setTitle(`Question: ${count++}`)
          .setDescription(`${questions[index++]}`)
          .setColor("AQUA")
          .setTimestamp();

        member.send({ embeds: [embed] });
      } else {
        const reply = new MessageEmbed()
          .setTitle("Application Received")
          .setColor("YELLOW")
          .setTimestamp();

        member.send({ embeds: [reply] });
        collector.stop("answered");
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "answered") {
        let index = 0;
        let count = 1;
        const responses = collected.map((msg) => {
          const number = count++;
          const question = questions[index++];
          const { content } = msg;
          return { number, question, content };
        });

        //   await sendApplication(responses, member);
      }
    });
  } catch (error) {
    logger.error(
      `An error happened while sending ${member} questions:  `,
      error
    );
  }
}
