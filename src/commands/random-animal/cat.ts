import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { BotCommand } from '../..';
import { COLORS } from '../../config/constants';

export const cat = async (args: BotCommand) => {
	const { message } = args;
	const response = await (await fetch('https://api.thecatapi.com/v1/images/search')).json();
	const catImage = new MessageEmbed()
		.setImage(response.at(0).url)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [catImage], allowedMentions: { repliedUser: false } });
};
