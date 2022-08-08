import { EmbedBuilder } from 'discord.js';
import schedule from 'node-schedule';
import { COLORS } from '../../config/constants.js';
import { BotCommand } from '../../index.js';

export const stop = async (args: BotCommand): Promise<void> => {
	const { message } = args;

	await schedule.gracefulShutdown();

	const botStoppedEmbed = new EmbedBuilder()
		.setTitle('Stopping Bot!')
		.setDescription('All running jobs gracefully shutdown.')
		.setColor(COLORS.FAIL);
	await message.reply({ embeds: [botStoppedEmbed] });

	process.exit(0);
};