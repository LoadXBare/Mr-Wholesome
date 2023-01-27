import { EmbedBuilder } from 'discord.js';
import { fetch } from 'undici';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command, Fox } from '../../index.js';

const foxCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const response = await fetch('https://randomfox.ca/floof/');
	const responseJSON = await response.json() as Fox;

	const foxImageEmbed = new EmbedBuilder()
		.setImage(responseJSON.image)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [foxImageEmbed] });
};

export const fox: Command = {
	devOnly: false,
	modOnly: false,
	run: foxCommand,
	type: 'Fun'
};
