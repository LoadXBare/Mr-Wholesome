import { ChannelType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { EmbedColours } from '../../lib/config.js';
import { DatabaseUtils } from '../../lib/utilities.js';

class SettingsCommand {
  interaction: ChatInputCommandInteraction;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
  }

  handle() {
    const commandGroup = this.interaction.options.getSubcommandGroup();
    if (commandGroup === 'logs') this.#handleLogsSettings();
  }

  async #handleLogsSettings() {
    const ignore = async () => {
      const { guildId } = this.interaction;
      const channelToIgnore = this.interaction.options.getChannel('channel', true, [
        ChannelType.AnnouncementThread,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildForum,
        ChannelType.GuildStageVoice,
        ChannelType.GuildText,
        ChannelType.GuildVoice,
        ChannelType.PrivateThread,
        ChannelType.PublicThread,
      ]);

      const success = await DatabaseUtils.addEventIgnoredChannel(guildId, channelToIgnore.id);
      const embed = new EmbedBuilder();

      if (success) {
        embed
          .setDescription(`## Successfully ignored ${channelToIgnore}!\nEvents will no longer be logged from it.`)
          .setColor(EmbedColours.Success);
      } else {
        embed
          .setDescription(`## Channel already ignored!\n${channelToIgnore} is either already ignored or an error occurred.`)
          .setColor(EmbedColours.Error);
      }

      this.interaction.reply({ embeds: [embed] });
    };

    const ignored = async () => {
      this.interaction.reply('blehhh');
    };

    const unignore = async () => {
      const { guildId } = this.interaction;
      const channelToUnignore = this.interaction.options.getChannel('channel', true, [
        ChannelType.AnnouncementThread,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildForum,
        ChannelType.GuildStageVoice,
        ChannelType.GuildText,
        ChannelType.GuildVoice,
        ChannelType.PrivateThread,
        ChannelType.PublicThread,
      ]);

      const success = await DatabaseUtils.removeEventIgnoredChannel(guildId, channelToUnignore.id);
      const embed = new EmbedBuilder();

      if (success) {
        embed
          .setDescription(`## Successfully unignored ${channelToUnignore}!\nEvents will now be logged from it.`)
          .setColor(EmbedColours.Success);
      } else {
        embed
          .setDescription(`## Channel not ignored!\n${channelToUnignore} is either not ignored or an error occurred.`)
          .setColor(EmbedColours.Error);
      }

      this.interaction.reply({ embeds: [embed] });
    };

    const command = this.interaction.options.getSubcommand();

    if (command === 'ignore') ignore();
    else if (command === 'ignored') ignored();
    else if (command === 'unignore') unignore();
  }
}
export default SettingsCommand;
