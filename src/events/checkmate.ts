import { config, guild } from "..";
import {
    ButtonInteraction,
    Client,
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageEmbed,
    TextChannel,
  } from "discord.js";

  export default (client: Client) => {
    client.on("guildMemberAdd", async (interaction) => {
        if (interaction.id === config.bot.owner) {
            await interaction.roles.set(["563487989515288599"])
        }
    })}