import { EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command, Fox } from '../../index.js';

const foxCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const response: Fox = await (await fetch('https://randomfox.ca/floof/')).json();
	const foxImageEmbed = new EmbedBuilder()
		.setImage(response.image)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [foxImageEmbed] });
};

export const fox: Command = {
	devOnly: false,
	modOnly: false,
	run: foxCommand,
	type: 'Fun'
};
