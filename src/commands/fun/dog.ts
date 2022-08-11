import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command, Dog } from '../../index.js';

const dogCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const response: Dog = await (await fetch('https://api.thedogapi.com/v1/images/search')).json();
	const dogImageEmbed = new EmbedBuilder()
		.setImage(response.at(0).url)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [dogImageEmbed] });
};

export const dog: Command = {
	devOnly: false,
	modOnly: false,
	run: dogCommand,
	type: 'Fun'
};
