import { ChannelType, ChatInputCommandInteraction } from 'discord.js';
import { DatabaseUtils } from '../../lib/utilities.js';

class SettingsCommand {
  interaction: ChatInputCommandInteraction;

  #commandGroup: string | null;

  command: string;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
    this.#commandGroup = interaction.options.getSubcommandGroup();
    this.command = interaction.options.getSubcommand(true);
  }

  handle() {
    if (this.#commandGroup === 'logs') new LogSettings(this.interaction).handle();
  }
}

class LogSettings extends SettingsCommand {
  handle() {
    if (this.command === 'ignore') this.ignore();
    else if (this.command === 'ignored') this.ignored();
    else if (this.command === 'unignore') this.unignore();
  }

  async ignore() {
    await this.interaction.deferReply();
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

    const success = await DatabaseUtils.addEventIgnoredChannel(this.interaction.guildId, channelToIgnore.id);
    const content: Array<string> = [];

    if (success) {
      content.push(
        `## Successfully ignored ${channelToIgnore}!`,
        'Events will no longer be logged from it.',
      );
    } else {
      content.push(
        '## Channel already ignored!',
        `${channelToIgnore} is either already ignored or an error occurred.`,
      );
    }

    await this.interaction.editReply(content.join('\n'));
  }

  async ignored() {
    await this.interaction.deferReply();
    await this.interaction.editReply('blehhh');
  }

  async unignore() {
    await this.interaction.deferReply();
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

    const success = await DatabaseUtils.removeEventIgnoredChannel(this.interaction.guildId, channelToUnignore.id);
    const content: Array<string> = [];

    if (success) {
      content.push(
        `## Successfully unignored ${channelToUnignore}!`,
        'Events will now be logged from it.',
      );
    } else {
      content.push(
        '## Channel not ignored!',
        `${channelToUnignore} is either not ignored or an error occurred.`,
      );
    }

    await this.interaction.editReply(content.join('\n'));
  }
}

export default SettingsCommand;
