import {
  GuildMember,
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel
} from 'discord.js';
import logger from './logger';
import { Response } from '../types';
import { client, config } from '..';
import { storeApplication } from '../db';

const {
  interviews,
  applications: { questions }
} = config;

// Change to Modal System
export async function sendQuestions(member: GuildMember) {
  try {
    if (!questions) {
      return logger.error('No application questions configured');
    }

    const filter = (m: Message) => m.author.id === member.id;

    let count = 1;
    let index = 0;

    const embed = new MessageEmbed()
      .setTitle(`Question: ${count++}`)
      .setDescription(`${questions[index++]}`)
      .setColor('AQUA')
      .setTimestamp();

    const { channel } = await member.send({ embeds: [embed] });

    const collector = channel.createMessageCollector({ filter });

    collector.on('collect', () => {
      if (index < questions.length) {
        const embed = new MessageEmbed()
          .setTitle(`Question: ${count++}`)
          .setDescription(`${questions[index++]}`)
          .setColor('AQUA')
          .setTimestamp();

        member.send({ embeds: [embed] });
      } else {
        const reply = new MessageEmbed()
          .setTitle('Application Received')
          .setColor('YELLOW')
          .setTimestamp();

        member.send({ embeds: [reply] });
        collector.stop('answered');
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'answered') {
        let index = 0;
        let count = 1;
        const responses = collected.map((msg) => {
          const number = count++;
          const question = questions[index++];
          const { content } = msg;
          return { number, question, content };
        });

        await postApplication(responses, member);
      }
    });
  } catch (error) {
    logger.error(
      `An error happened while sending ${member} questions:  `,
      error
    );
  }
}

export async function postApplication(
  response: Response[],
  member: GuildMember
) {
  // Type asserted because without it the bot wont know where to send applicaitons
  const applicationChannel = (await client.channels.fetch(
    config.applications.applications_channel
  )) as TextChannel;

  if (!applicationChannel)
    return logger.error(
      `Error trying to find applications channel to send ${member} application`
    );

  const row = new MessageActionRow();

  row.addComponents(
    new MessageButton()
      .setCustomId('accept')
      .setStyle('SUCCESS')
      .setLabel('Accept')
      .setEmoji('➕')
  );
  row.addComponents(
    new MessageButton()
      .setCustomId('deny')
      .setStyle('DANGER')
      .setLabel('Deny')
      .setEmoji('➖')
  );
  row.addComponents(
    new MessageButton()
      .setCustomId('ban')
      .setStyle('SECONDARY')
      .setLabel('Ban')
      .setEmoji('⛔')
  );

  const author = {
    name: member.displayName,
    iconURL: member.user.displayAvatarURL({ dynamic: true })
  };

  var embed = new MessageEmbed()
    .setColor('YELLOW')
    .setAuthor(author)
    .setTitle(`${member.user.tag} has submitted an application`)
    .setThumbnail(
      member.displayAvatarURL({
        dynamic: true
      })
    )
    .setTimestamp();

  // Solution is from https://github.com/Milrato-Development/Easiest-Application go check them out >.>
  try {
    for (var i = 0; i < response.length; i++) {
      let qu = response[i].question;
      if (qu.length > 100) qu = response[i].question.substring(0, 100) + ' ...';
      embed.addField(
        qu.substring(0, 256),
        '>>> ' + response[i].content.substring(0, 1000)
      );
    }

    const message = await applicationChannel.send({
      embeds: [embed],
      components: [row]
    });

    await storeApplication(message.id, member.id);
    // storeApplication(message.id, member.id);
  } catch (error) {
    logger.error(
      `Error while submitting user application ${response}: \n`,
      error
    );
  }
}

export async function conductInterview(member: GuildMember) {
  try {
    if (
      !interviews.interview_channel ||
      !interviews.interview_role ||
      !interviews.notification
    )
      return logger.error('Please check configurations');

    await member.roles.add(interviews.interview_role);

    const interviewChannel = client.channels.cache.get(
      interviews.interview_channel
    );

    const { displayName } = member;

    const thread = await (interviewChannel as TextChannel).threads.create({
      name: displayName
    });

    await thread.members.add(member);

    await thread.join();

    await thread.send(interviews.notification);
  } catch (error) {
    return logger.error(
      'Error setting up interviews please check your configurations and retry: ',
      error
    );
  }
}
