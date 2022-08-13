import { Attachment, AttachmentBuilder, Client, Collection, TextChannel } from 'discord.js';
import { config } from '../../private/config.js';

export const storeAttachments = async (attachments: Collection<string, Attachment>, client: Client): Promise<Array<string>> => {
	const imageStorageChannel = await client.channels.fetch(config.channelIDs.botImageStorage) as TextChannel;
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

export const storeAttachment = async (attachment: AttachmentBuilder, client: Client): Promise<string> => {
	const imageStorageChannel = await client.channels.fetch(config.channelIDs.botImageStorage) as TextChannel;

	try {
		const storedImage = await imageStorageChannel.send({
			files: [attachment]
		});

		const attachmentURL = storedImage.attachments.at(0).url;
		return attachmentURL;
	}
	catch {
		return null;
	}
};
