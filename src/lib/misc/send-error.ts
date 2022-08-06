import { Message, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { config } from '../../private/config.js';

export const sendError = (message: Message, data: string): void => {
	const replyEmbed = new MessageEmbed()
		.setAuthor({ name: 'Error', iconURL: config.botEmoteUrls.error })
		.setDescription(data)
		.setColor(COLORS.FAIL);
	try {
		message.reply({ embeds: [replyEmbed] });
	}
	catch (e) {
		console.error(e);
	}
};
