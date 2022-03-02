import { channelMention, formatEmoji } from '@discordjs/builders';
import { Message, MessageEmbed, PartialMessage, TextChannel } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchIgnoredChannels } from '../../lib/misc/fetch-ignored-channels.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes, privateChannels } from '../../private/config.js';

export const messageDelete = async (message: Message | PartialMessage) => {
	const {
		author, client, guild,
		channelId, content, attachments,
		member
	} = message;
	const logChannel = await fetchLogChannel(guild.id, client);
	const ignoredChannels = await fetchIgnoredChannels(guild.id);

	if (
		author.bot ||
		logChannel === null ||
		ignoredChannels.includes(message.channelId)
	) return;

	const action = await guild.fetchAuditLogs({ type: 'MESSAGE_DELETE', limit: 1 });
	const logEntry = new MessageEmbed()
		.setAuthor({ name: author.tag, iconURL: member.avatarURL() === null ? author.avatarURL() : member.avatarURL() })
		.setTitle(`${formatEmoji(emotes.msgDelete)} Message Deleted`)
		.setFields([
			{ name: 'Channel', value: channelMention(channelId) }
		])
		.setFooter({ text: `Author ID: ${author.id} • Deleted by: ${action.entries.at(0).executor.tag}` })
		.setTimestamp(Date.now())
		.setColor(COLORS.NEGATIVE);

	// Message contains text
	if (content !== '') logEntry.addField('Message', content);

	// Message was deleted by the person who sent it
	if (action.entries.at(0).target.id !== author.id) logEntry.setFooter({ text: `Author ID: ${author.id} • Deleted by: ${author.tag}` });

	// Message contained an image
	if (typeof attachments.at(0) !== 'undefined') {
		// TODO: Handle multiple attachments
		const attachment = attachments.at(0);

		if (!attachment.contentType.startsWith('image') || attachment.size > 8_000_000) return;

		const imageStorageChannel = await client.channels.fetch(privateChannels.imageStorage.id) as TextChannel;
		const storedImage = await imageStorageChannel.send({ files: [{ attachment: attachment.url, description: attachment.name }] });

		logEntry.setImage(storedImage.attachments.at(0).url);
	}

	await logChannel.send({ embeds: [logEntry] });
};
