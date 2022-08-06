import { channelMention, inlineCode } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
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

	const auditLogs = await guild.fetchAuditLogs({ type: 'MESSAGE_DELETE', limit: 1 });
	const latestAuditLog = auditLogs.entries.at(0) ?? null;

	const logEntryEmbed = new MessageEmbed()
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
	if (latestAuditLog === null || latestAuditLog.target.id !== author.id) {
		logEntryEmbed.addField(
			'Deleted By',
			author.tag,
			true
		);
	}
	else {
		logEntryEmbed.addField(
			'Deleted By',
			latestAuditLog.executor.tag,
			true
		);
	}

	// Message contains text
	if (content !== '') {
		logEntryEmbed.addField(
			'Message',
			trimContent(content, 1024)
		);
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
				logEntryEmbed.addField(
					'Attachments',
					'`Message contained an attachment that was either too large or not an image file.`'
				);
			}
			else {
				logEntryEmbed.setImage(imageURLs.at(0));
			}
		}
		else if (imageURLs.includes('U')) {
			logEntryEmbed.addField(
				'Attachments',
				`${inlineCode('Message contained one or more attachments that were either too large or not image files.')}\
				\n\n${imageURLsList}`
			);
		}
		else {
			logEntryEmbed.addField('Attachments', `${imageURLsList}`);
		}
	}

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(config.botEmoteUrls.watchlist);
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
