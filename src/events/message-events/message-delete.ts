import { channelMention, inlineCode } from '@discordjs/builders';
import { Message, MessageEmbed, PartialMessage } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchIgnoredChannels } from '../../lib/misc/fetch-ignored-channels.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { storeAttachments } from '../../lib/misc/store-attachments.js';
import { emotes } from '../../private/config.js';

export const messageDelete = async (message: Message | PartialMessage) => {
	const { author, client, guild, channelId, content, attachments, member } = message;
	const logChannel = await fetchLogChannel(guild.id, client);
	const ignoredChannels = await fetchIgnoredChannels(guild.id);

	if (author.bot || logChannel === null || ignoredChannels.includes(channelId))
		return;

	const latestAuditLog = (await guild.fetchAuditLogs({ type: 'MESSAGE_DELETE', limit: 1 })).entries.at(0);

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: 'Message Deleted',
			iconURL: emojiUrl(emotes.msgDelete)
		})
		.setFields([
			{ name: 'Channel', value: channelMention(channelId), inline: true }
		])
		.setFooter({ text: `${author.tag} • Author ID: ${author.id}`, iconURL: member.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.NEGATIVE);

	// Message was deleted by the person who sent it
	if (latestAuditLog.target.id !== author.id)
		logEntry.addField('Deleted By', author.tag, true);
	else
		logEntry.addField('Deleted By', latestAuditLog.executor.tag, true);

	// Message contains text
	if (content !== '')
		logEntry.addField('Message', content);


	// Message contained an image
	if (typeof attachments.at(0) !== 'undefined') {
		const imageURLs = await storeAttachments(attachments, client);

		let imageURLsList = '';
		for (const imageURL of imageURLs) {
			if (imageURL === 'U')
				continue;
			imageURLsList = imageURLsList.concat(`${imageURL}\n\n`);
		}

		if (imageURLs.length === 1) {
			if (imageURLs.at(0) === 'U')
				logEntry.addField('Attachments', '`Message contained an attachment that was either too large or not an image file.`');
			else
				logEntry.setImage(imageURLs.at(0));
		} else if (imageURLs.includes('U')) {
			logEntry.addField('Attachments', `${inlineCode('Message contained one or more attachments that were either too large or not image files.')}\
			\n\n${imageURLsList}`);
		} else {
			logEntry.addField('Attachments', `${imageURLsList}`);
		}
	}

	logChannel.send({ embeds: [logEntry] });
};
