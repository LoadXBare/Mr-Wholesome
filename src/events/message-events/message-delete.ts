import dayjs from 'dayjs';
import { AuditLogEvent, channelMention, EmbedBuilder, inlineCode, Message } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { fetchIgnoredChannels } from '../../lib/misc/fetch-ignored-channels.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { storeAttachments } from '../../lib/misc/store-attachments.js';
import { config } from '../../private/config.js';

const trimContent = (content: string, maxContentLength: number): string => {
	if (content.length >= maxContentLength) {
		return `${content.slice(0, maxContentLength - 3)}...`;
	}
	else {
		return content;
	}
};

export const messageDelete = async (message: Message): Promise<void> => {
	const { author, client, guild, channelId, content, attachments, member } = message;
	const onWatchlist = await checkWatchlist(author.id);
	const logChannel = await fetchLogChannel(guild.id, client);
	const ignoredChannels = await fetchIgnoredChannels(guild.id);

	if (author.bot || logChannel === null || ignoredChannels.includes(channelId)) {
		return;
	}

	const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 });
	const latestAuditLog = auditLogs.entries.first();

	const logEntryEmbed = new EmbedBuilder()
		.setAuthor({
			name: 'Message Deleted'
		})
		.setFields([
			{
				name: 'Channel',
				value: channelMention(channelId),
				inline: true
			}
		])
		.setFooter({ text: `${author.tag} • Author ID: ${author.id}`, iconURL: member.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.NEGATIVE);

	// Message was deleted by the person who sent it
	if (typeof latestAuditLog === 'undefined'
		|| latestAuditLog.target.id !== author.id
		|| (dayjs().valueOf() - 10000) > latestAuditLog.createdTimestamp // was the audit log created in the last 10 seconds?
	) {
		logEntryEmbed.addFields([
			{
				name: 'Deleted By',
				value: author.tag,
				inline: true
			}
		]);
	}
	else {
		logEntryEmbed.addFields([
			{
				name: 'Deleted By',
				value: latestAuditLog.executor.tag,
				inline: true
			}
		]);
	}

	// Message contains text
	if (content !== '') {
		logEntryEmbed.addFields([
			{
				name: 'Message',
				value: trimContent(content, 1024)
			}
		]);
	}

	// Message contained an image
	if (typeof attachments.at(0) !== 'undefined') {
		const imageURLs = await storeAttachments(attachments, client);

		let imageURLsList = '';
		for (const imageURL of imageURLs) {
			if (imageURL === 'U') {
				continue;
			}
			imageURLsList = imageURLsList.concat(`${imageURL}\n\n`);
		}

		if (imageURLs.length === 1) {
			if (imageURLs.at(0) === 'U') {
				logEntryEmbed.addFields([
					{
						name: 'Attachments',
						value: inlineCode('Message contained an attachment that was either too large or not an image file.')
					}
				]);
			}
			else {
				logEntryEmbed.setImage(imageURLs.at(0));
			}
		}
		else if (imageURLs.includes('U')) {
			logEntryEmbed.addFields([
				{
					name: 'Attachments',
					value: `${inlineCode('Message contained one or more attachments that were either too large or not image files.')}\
					\n\n${imageURLsList}`
				}
			]);
		}
		else {
			logEntryEmbed.addFields([
				{
					name: 'Attachments',
					value: imageURLsList
				}
			]);
		}
	}

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(config.botEmoteUrls.watchlist);
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
