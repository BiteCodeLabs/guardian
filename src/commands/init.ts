import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  TextChannel
} from 'discord.js';
import { config } from '..';
import logger from '../modules/logger';
import { ICommand } from 'wokcommands';

export default {
  category: 'Applications',
  description: 'Initializes the bot application module',

  permissions: ['ADMINISTRATOR'],
  slash: 'both',
  guildOnly: true,

  callback: async ({ guild }) => {
    const joinChannel = guild?.channels.cache.get(
      config.bot.join_channel
    ) as TextChannel;

    if (!joinChannel) {
      logger.error(
        'Join channel was not detected... please check your configs and reload the bot'
      );
      return 'Join channel was not detected... please check your configs and reload the bot';
    }

    const row = new MessageActionRow();

    const embed = new MessageEmbed()
      .setColor('BLUE')
      .addFields({
        name: 'Hi',
        value: `${config.applications.join_message}`,
        inline: true
      })
      .setTimestamp();

    row.addComponents(
      new MessageButton()
        .setCustomId('apply')
        .setStyle('PRIMARY')
        .setLabel('Apply')
        .setEmoji('📜')
    );

    await joinChannel.send({
      embeds: [embed],
      components: [row]
    });
  }
} as ICommand;
