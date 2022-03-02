import { channelMention, formatEmoji, hyperlink } from '@discordjs/builders';
import { Message, MessageEmbed, PartialMessage } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchIgnoredChannels } from '../../lib/misc/fetch-ignored-channels.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes } from '../../private/config.js';

const GetIndexOfFirstEdit = (oldContent: string, newContent: string) => {
	const lengthOfLongestMessage: number =
		oldContent.length > newContent.length
			? newContent.length
			: oldContent.length;

	for (let i = 0; i < lengthOfLongestMessage; i++) {
		if (oldContent[i] === newContent[i]) continue;
		else return i;
	}

	if (oldContent.length !== newContent.length) return lengthOfLongestMessage - 1;
};

export const messageUpdate = async (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) => {
	let { content: oldContent } = oldMessage;
	let { content: newContent } = newMessage;
	const { client, author, channel, url, guildId, member } = newMessage;
	const maxLength = 800;

	const logChannel = await fetchLogChannel(guildId, client);
	const ignoredChannels = await fetchIgnoredChannels(guildId);

	if (
		author.bot ||
		logChannel === null ||
		ignoredChannels.includes(channel.id) ||
		oldContent === newContent
	) return;

	let indexOfFirstEdit = GetIndexOfFirstEdit(oldContent, newContent);
	indexOfFirstEdit =
		indexOfFirstEdit - 10 < 0
			? 0
			: indexOfFirstEdit - 10;

	oldContent = `${indexOfFirstEdit === 0 ? '' : '...'}${oldContent.slice(indexOfFirstEdit)}`;
	if (oldContent.length > maxLength) oldContent = `${oldContent.slice(0, maxLength)}...`;
	newContent = `${indexOfFirstEdit === 0 ? '' : '...'}${newContent.slice(indexOfFirstEdit)}`;
	if (newContent.length > maxLength) newContent = `${newContent.slice(0, maxLength)}...`;

	const logEntry = new MessageEmbed()
		.setAuthor({ name: author.tag, iconURL: member.avatarURL() === null ? author.avatarURL() : member.avatarURL() })
		.setTitle(`${formatEmoji(emotes.msgUpdate)} Message Edited`)
		.setFields([
			{ name: 'Channel', value: `${channelMention(channel.id)} ${hyperlink('Jump to message', url)}` },
			{ name: 'Before', value: oldContent },
			{ name: 'After', value: newContent }
		])
		.setFooter({ text: `Author ID: ${author.id}` })
		.setTimestamp(Date.now())
		.setColor(COLORS.NEUTRAL);

	logChannel.send({ embeds: [logEntry] });
};
