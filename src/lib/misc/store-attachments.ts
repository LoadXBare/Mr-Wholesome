import { Client, Collection, MessageAttachment, TextChannel } from 'discord.js';
import { config } from '../../private/config.js';

export const storeAttachments = async (attachments: Collection<string, MessageAttachment>, client: Client): Promise<Array<string>> => {
	const imageStorageChannel = await client.channels.fetch(config.privateChannels.imageStorage) as TextChannel;
	const imageURLs: Array<string> = [];

	for (const attachment of attachments) {
		const messageAttachment = attachment[1];
		if (!messageAttachment.contentType.startsWith('image') || messageAttachment.size > 8_000_000) {
			imageURLs.push('U');
			continue;
		}

		const storedMessage = await imageStorageChannel.send({
			files: [{
				attachment: messageAttachment.url
			}]
		});
		const storedImageURL = storedMessage.attachments.at(0).url;
		imageURLs.push(storedImageURL);
	}

	return imageURLs;
};
