import { channelMention, hyperlink } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { AttachmentUpdate, ContentUpdate } from '../../index.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchIgnoredChannels } from '../../lib/misc/fetch-ignored-channels.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { storeAttachments } from '../../lib/misc/store-attachments.js';
import { emotes } from '../../private/config.js';

const GetIndexOfFirstEdit = (oldContent: string, newContent: string) => {
	const lengthOfLongestMessage =
		oldContent.length > newContent.length
			? newContent.length
			: oldContent.length;

	for (let i = 0; i < lengthOfLongestMessage; i++) {
		if (oldContent[i] === newContent[i])
			continue;
		else
			return i;
	}

	if (oldContent.length !== newContent.length)
		return lengthOfLongestMessage - 1;
};

const editContent = (content: string, sliceIndex: number, maxLength: number) => {
	// Slice the content at the index of the first edit and prefix with "..." if the slice index is greater than 0
	const editedContent = `${sliceIndex <= 0 ? '' : '...'}${content.slice(sliceIndex <= 0 ? 0 : sliceIndex)}`;

	// If the edited content is greater than the specified maximum length, slice at max length and suffix with "..."
	if (editedContent.length > maxLength)
		return `${editedContent.slice(0, maxLength)}...`;

	return editedContent;
};

const contentUpdate = async (args: ContentUpdate) => {
	const { oldContent, newContent, message } = args;
	const { author, channel, member } = message;
	const maxLength = 800;
	const charsBeforeEdit = 10;
	let editedOldContent = oldContent;
	let editedNewContent = newContent;

	if (author.bot)
		return;

	const indexOfFirstEdit = GetIndexOfFirstEdit(oldContent, newContent);
	const sliceIndex = indexOfFirstEdit - charsBeforeEdit;

	editedOldContent = editContent(oldContent, sliceIndex, maxLength);
	editedNewContent = editContent(newContent, sliceIndex, maxLength);

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: 'Message Edited',
			iconURL: emojiUrl(emotes.msgUpdate)
		})
		.setFields([
			{ name: 'Channel', value: `${channelMention(channel.id)} ${hyperlink('Jump to message', message.url)}` },
			{ name: 'Before', value: editedOldContent },
			{ name: 'After', value: editedNewContent }
		])
		.setFooter({ text: `${author.tag} • Author ID: ${author.id}`, iconURL: member.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.NEUTRAL);

	return logEntry;
};

const attachmentUpdate = async (args: AttachmentUpdate) => {
	const { message, newAttachments, oldAttachments } = args;
	const removedAttachment = oldAttachments.difference(newAttachments);
	const imageURLs = await storeAttachments(removedAttachment, message.client);

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: 'Message Attachment Removed',
			iconURL: emojiUrl(emotes.attachmentUpdate)
		})
		.setFields([
			{ name: 'Channel', value: `${channelMention(message.channelId)} ${hyperlink('Jump to Message', message.url)}` }
		])
		.setColor(COLORS.NEGATIVE);

	if (imageURLs.at(0) === 'U')
		logEntry.addField('Attachment', '`Attachment that was removed was either too large or not an image file.`');
	else
		logEntry.setImage(imageURLs.at(0));

	return logEntry;
};

export const messageUpdate = async (oldMessage: Message, newMessage: Message) => {
	const { content: oldContent, attachments: oldAttachments } = oldMessage;
	const { content: newContent, attachments: newAttachments, guildId, client, channelId } = newMessage;

	const logChannel = await fetchLogChannel(guildId, client);
	const ignoredChannels = await fetchIgnoredChannels(guildId);

	if (!logChannel || ignoredChannels.includes(channelId))
		return;

	let logEntry: MessageEmbed;
	if (oldContent !== newContent)
		logEntry = await contentUpdate({ message: newMessage, newContent: newContent, oldContent: oldContent });
	else if (!oldAttachments.equals(newAttachments))
		logEntry = await attachmentUpdate({ message: newMessage, newAttachments: newAttachments, oldAttachments: oldAttachments });

	if (!logEntry)
		return;

	logChannel.send({ embeds: [logEntry] });
};
