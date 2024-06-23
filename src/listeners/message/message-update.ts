import { diffChars } from 'diff';
import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder,
  Events, Message, PartialMessage, bold,
  strikethrough,
} from 'discord.js';
import client from '../../index.js';
import { EmbedColours, EventHandler, Images, database } from '../../lib/config.js';
import { Utils, dbUtils } from '../../lib/utilities.js';

class MessageUpdateHandler extends EventHandler {
  oldMessage: Message | PartialMessage;

  newMessage: Message | PartialMessage;

  constructor(oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
    super();
    this.oldMessage = oldMessage;
    this.newMessage = newMessage;
  }

  async handle() {
    const { guildId, channelId, author } = this.newMessage;
    const channelHasEventsIgnored = await dbUtils.channelIgnoresEvents(guildId, channelId);
    if (author?.bot || channelHasEventsIgnored) return;

    this.#logEditedMessage();
    this.#logRemovedMessageAttachment();
  }

  async #logEditedMessage() {
    if (this.oldMessage.content === this.newMessage.content) return;
    const contentDifference = diffChars(this.oldMessage.content ?? '', this.newMessage.content ?? '');

    const formattedContentDifference: Array<string> = [];
    contentDifference.forEach((difference) => {
      if (difference.added) formattedContentDifference.push(bold(difference.value));
      else if (difference.removed) formattedContentDifference.push(strikethrough(difference.value));
      else formattedContentDifference.push(difference.value);
    });

    const embedDescription = [
      `## Message Edited in ${this.newMessage.channel}`,
      '### Changes',
      formattedContentDifference.join(''),
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setFooter({
        text: `@${this.newMessage.author?.username} • User ID: ${this.newMessage.author?.id}`,
        iconURL: this.newMessage.author?.displayAvatarURL(),
      })
      .setTimestamp()
      .setColor(EmbedColours.Neutral);

    const jumpButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Jump To Message')
        .setStyle(ButtonStyle.Link)
        .setURL(this.newMessage.url),
    );

    const watchlist = await this.#fetchWatchlist();
    const userOnWatchlist = watchlist.map((note) => note.watchedID).includes(this.newMessage.author?.id ?? '');
    if (userOnWatchlist) embed.setThumbnail(Images.WatchedUser);

    super.logChannel.send({ embeds: [embed], components: [jumpButton] });
  }

  async #logRemovedMessageAttachment() {
    if (this.oldMessage.attachments.size === this.newMessage.attachments.size) return;
    const embeddableContentTypes = ['image/png', 'image/gif', 'image/webp', 'image/jpeg'];
    const removedAttachment = this.oldMessage.attachments.difference(this.newMessage.attachments);

    const storedAttachment = (await Utils.storeAttachments(removedAttachment)).at(0);
    const embedDescription = [
      '## Message Attachment Removed',
      `### in ${this.newMessage.channel}`,
      '### Attachment',
      storedAttachment?.maskedLink,
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setFooter({
        text: `@${this.newMessage.author?.username} • Author ID: ${this.newMessage.author?.id}`,
        iconURL: this.newMessage.author?.displayAvatarURL(),
      })
      .setTimestamp()
      .setColor(EmbedColours.Neutral);

    if (storedAttachment?.link !== '' && embeddableContentTypes.includes(storedAttachment?.type ?? '')) {
      embed.setImage(storedAttachment?.link ?? '');
    }

    const jumpButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Jump To Message')
        .setStyle(ButtonStyle.Link)
        .setURL(this.newMessage.url),
    );

    const watchlist = await this.#fetchWatchlist();
    const userOnWatchlist = watchlist.map((note) => note.watchedID).includes(this.newMessage.author?.id ?? '');
    if (userOnWatchlist) embed.setThumbnail(Images.WatchedUser);

    super.logChannel.send({ embeds: [embed], components: [jumpButton] });
  }

  // == Database Methods ==
  async #fetchWatchlist() {
    const result = await database.notes.findMany({
      where: { guildID: this.newMessage.guild?.id }
    });

    return result;
  }
}

client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
  new MessageUpdateHandler(oldMessage, newMessage).handle();
});
