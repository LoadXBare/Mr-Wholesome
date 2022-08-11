import { EmbedBuilder } from 'discord.js';
import schedule from 'node-schedule';
import { client } from '../../bot.js';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';

const stopCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;

	await schedule.gracefulShutdown();

	const botStoppedEmbed = new EmbedBuilder()
		.setTitle('Stopping Bot!')
		.setDescription('All running jobs gracefully shutdown.')
		.setColor(COLORS.FAIL);
	await message.reply({ embeds: [botStoppedEmbed] });

	client.destroy();
	process.exit(0);
};

export const stop: Command = {
	devOnly: true,
	modOnly: false,
	run: stopCommand,
	type: 'Dev'
};
