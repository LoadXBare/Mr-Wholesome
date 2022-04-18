import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { BotCommand } from '../..';
import { COLORS } from '../../config/constants';

export const dog = async (args: BotCommand) => {
	const { message } = args;
	const response = await (await fetch('https://api.thedogapi.com/v1/images/search')).json();
	const dogImage = new MessageEmbed()
		.setImage(response.at(0).url)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [dogImage], allowedMentions: { repliedUser: false } });
};
