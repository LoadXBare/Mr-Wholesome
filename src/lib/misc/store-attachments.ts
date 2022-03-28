import { Client, Collection, MessageAttachment, TextChannel } from 'discord.js';
import { privateChannels } from '../../private/config.js';

/**
 * Returns permanent direct URLs for the MessageAttachments passed through.
 * 
 * @param attachments A Discord.JS Collection of MessageAttachments.
 * @param client The bot client.
 */
export const storeAttachments = async (attachments: Collection<string, MessageAttachment>, client: Client) => {
	const imageStorageChannel = await client.channels.fetch(privateChannels.imageStorage) as TextChannel;
	const imageURLs: Array<string> = [];

	for (const attachment of attachments) {
		if (!attachment[1].contentType.startsWith('image') || attachment[1].size > 8_000_000) {
			imageURLs.push('U');
			continue;
		}

		const storedMessage = await imageStorageChannel.send({
			files: [{
				attachment: attachment[1].url
			}]
		});
		const storedImageURL = storedMessage.attachments.at(0).url;
		imageURLs.push(storedImageURL);
	}

	return imageURLs;
};
