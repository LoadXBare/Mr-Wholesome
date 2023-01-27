import { EmbedBuilder } from 'discord.js';
import { fetch } from 'undici';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command, Dog } from '../../index.js';

const dogCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const response = await fetch('https://api.thedogapi.com/v1/images/search');
	const responseJSON = await response.json() as Dog;

	const dogImageEmbed = new EmbedBuilder()
		.setImage(responseJSON.at(0).url)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [dogImageEmbed] });
};

export const dog: Command = {
	devOnly: false,
	modOnly: false,
	run: dogCommand,
	type: 'Fun'
};
