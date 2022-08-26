import { Attachment, channelMention, Collection, EmbedBuilder, hyperlink, inlineCode, Message } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { fetchIgnoredChannels } from '../../lib/misc/fetch-ignored-channels.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { storeAttachments } from '../../lib/misc/store-attachments.js';
import { config } from '../../private/config.js';

const GetIndexOfFirstEdit = (oldContent: string, newContent: string): number => {
	let lengthOfLongestMessage: number;
	if (oldContent.length > newContent.length) {
		lengthOfLongestMessage = oldContent.length;
	}
	else {
		lengthOfLongestMessage = newContent.length;
	}

	for (let i = 0; i < lengthOfLongestMessage; i++) {
		if (oldContent.charAt(i) === newContent.charAt(i)) {
			continue;
		}
		else {
			return i;
		}
	}

	if (oldContent.length !== newContent.length) {
		return lengthOfLongestMessage - 1;
	}
};

const editContent = (content: string, sliceIndex: number, maxLength: number): string => {
	// Slice the content at the index of the first edit and prefix with "..." if the slice index is greater than 0
	const editedContent = `${sliceIndex <= 0 ? '' : '...'}${content.slice(sliceIndex <= 0 ? 0 : sliceIndex)}`;

	// If the edited content is greater than the specified maximum length, slice at max length and suffix with "..."
	if (editedContent.length > maxLength) {
		return `${editedContent.slice(0, maxLength)}...`;
	}
	else {
		return editedContent;
	}
};

const contentUpdate = (oldContent: string, newContent: string, message: Message): EmbedBuilder => {
	const { author, channel, member } = message;
	const maxLength = 800;
	const charsBeforeEdit = 10;
	let editedOldContent = oldContent;
	let editedNewContent = newContent;

	const indexOfFirstEdit = GetIndexOfFirstEdit(oldContent, newContent);
	const sliceIndex = indexOfFirstEdit - charsBeforeEdit;

	editedOldContent = editContent(oldContent, sliceIndex, maxLength);
	editedNewContent = editContent(newContent, sliceIndex, maxLength);

	if (editedOldContent.length === 0) {
		editedOldContent = inlineCode('None');
	}
	if (editedNewContent.length === 0) {
		editedNewContent = inlineCode('None');
	}

	const logEntryEmbed = new EmbedBuilder()
		.setAuthor({
			name: 'Message Edited'
		})
		.setFields([
			{
				name: 'Channel',
				value: `${channelMention(channel.id)} ${hyperlink('Jump to message', message.url)}`
			},
			{
				name: 'Before',
				value: editedOldContent
			},
			{
				name: 'After',
				value: editedNewContent
			}
		])
		.setFooter({ text: `${author.tag} • Author ID: ${author.id}`, iconURL: member.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.NEUTRAL);

	return logEntryEmbed;
};

const attachmentUpdate = async (oldAttachments: Collection<string, Attachment>, newAttachments: Collection<string, Attachment>, message: Message): Promise<EmbedBuilder> => {
	const removedAttachment = oldAttachments.difference(newAttachments);
	const imageURLs = await storeAttachments(removedAttachment, message.client);

	const logEntryEmbed = new EmbedBuilder()
		.setAuthor({
			name: 'Message Attachment Removed'
		})
		.setFields([
			{
				name: 'Channel',
				value: `${channelMention(message.channelId)} ${hyperlink('Jump to Message', message.url)}`
			}
		])
		.setColor(COLORS.NEGATIVE);

	if (imageURLs.at(0) === 'U') {
		logEntryEmbed.addFields([
			{
				name: 'Attachment',
				value: inlineCode('Attachment that was removed was either too large or not an image file.')
			}
		]);
	}
	else {
		logEntryEmbed.setImage(imageURLs.at(0));
	}

	return logEntryEmbed;
};

export const messageUpdate = async (oldMessage: Message, newMessage: Message): Promise<void> => {
	const { content: oldContent, attachments: oldAttachments } = oldMessage;
	const { content: newContent, attachments: newAttachments, guildId, client, channelId, author } = newMessage;

	const onWatchlist = await checkWatchlist(author.id);
	const logChannel = await fetchLogChannel(guildId, client);
	const ignoredChannels = await fetchIgnoredChannels(guildId);

	if (author.bot || logChannel === null || ignoredChannels.includes(channelId)) {
		return;
	}

	let logEntryEmbed: EmbedBuilder;
	if (oldContent !== newContent) {
		logEntryEmbed = await contentUpdate(oldContent, newContent, newMessage);
	}
	else if (!oldAttachments.equals(newAttachments)) {
		logEntryEmbed = await attachmentUpdate(oldAttachments, newAttachments, newMessage);
	}
	else {
		return;
	}

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(config.botEmoteUrls.warning);
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
