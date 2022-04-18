import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { BotCommand } from '../..';
import { COLORS } from '../../config/constants';

export const fox = async (args: BotCommand) => {
	const { message } = args;
	const response = await (await fetch('https://randomfox.ca/floof/')).json();
	const foxImage = new MessageEmbed()
		.setImage(response.image)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [foxImage], allowedMentions: { repliedUser: false } });
};
