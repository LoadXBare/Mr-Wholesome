import { EmbedBuilder } from 'discord.js';
import { fetch } from 'undici';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Cat, Command } from '../../index.js';

const catCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const response = await fetch('https://api.thecatapi.com/v1/images/search');
	const responseJSON = await response.json() as Cat;

	const catImageEmbed = new EmbedBuilder()
		.setImage(responseJSON.at(0).url)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [catImageEmbed] });
};

export const cat: Command = {
	devOnly: false,
	modOnly: false,
	run: catCommand,
	type: 'Fun'
};
