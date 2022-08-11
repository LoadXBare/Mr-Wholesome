import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Cat, Command } from '../../index.js';

const catCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const response: Cat = await (await fetch('https://api.thecatapi.com/v1/images/search')).json();
	const catImageEmbed = new EmbedBuilder()
		.setImage(response.at(0).url)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [catImageEmbed] });
};

export const cat: Command = {
	devOnly: false,
	modOnly: false,
	run: catCommand,
	type: 'Fun'
};
