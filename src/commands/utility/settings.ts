import { ChannelType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import client from '../../index.js';
import { EmbedColours } from '../../lib/config.js';
import { DatabaseUtils } from '../../lib/utilities.js';

export default class SettingsCommand {
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
    const embedDescription: Array<string> = [];
    const embed = new EmbedBuilder();

    if (success) {
      embed.setColor(EmbedColours.Success);
      embedDescription.push(
        `## Successfully ignored ${channelToIgnore}!`,
        'Events will no longer be logged from it.',
      );
    } else {
      embed.setColor(EmbedColours.Error);
      embedDescription.push(
        '## Channel already ignored!',
        `${channelToIgnore} is either already ignored or an error occurred.`,
      );
    }

    embed.setDescription(embedDescription.join('\n'));

    await this.interaction.editReply({ embeds: [embed] });
  }

  async ignored() {
    await this.interaction.deferReply();
    const eventIgnoredChannelIDs = await DatabaseUtils.fetchEventIgnoredChannels(this.interaction.guildId);
    const embedDescription = [
      '## Event Ignored Channels',
    ];

    if (eventIgnoredChannelIDs.length > 0) {
      embedDescription.push('The following channels are all currently ignoring events:');
    } else {
      embedDescription.push('This guild has no channels ignoring events!');
    }

    eventIgnoredChannelIDs.forEach((id) => {
      const channel = client.channels.resolve(id);
      embedDescription.push(`- ${channel}`);
    });

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor(EmbedColours.Info);

    await this.interaction.editReply({ embeds: [embed] });
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
    const embedDescription: Array<string> = [];
    const embed = new EmbedBuilder();

    if (success) {
      embed.setColor(EmbedColours.Success);
      embedDescription.push(
        `## Successfully unignored ${channelToUnignore}!`,
        'Events will now be logged from it.',
      );
    } else {
      embed.setColor(EmbedColours.Error);
      embedDescription.push(
        '## Channel not ignored!',
        `${channelToUnignore} is either not ignored or an error occurred.`,
      );
    }

    embed.setDescription(embedDescription.join('\n'));

    await this.interaction.editReply({ embeds: [embed] });
  }
}
