import { EmbedBuilder, inlineCode } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { fetchUptime } from '../../lib/misc/fetch-uptime.js';

const pingCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const uptime = fetchUptime();
	const uptimeText = `${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes & ${uptime.seconds} seconds`;

	const reply = await message.reply({ content: 'uwu' });
	const pingCommand = new EmbedBuilder()
		.setTitle('Tweet!')
		.setDescription(`⌛ ⇒ ${inlineCode(`${reply.createdTimestamp - message.createdTimestamp}ms`)}\
		\n☁️ ⇒ ${inlineCode(`${message.client.ws.ping}ms`)}\
		\n⏱️ ⇒ ${inlineCode(uptimeText)}`)
		.setColor(COLORS.COMMAND);

	reply.edit({ content: null, embeds: [pingCommand] });
};

export const ping: Command = {
	devOnly: false,
	modOnly: false,
	run: pingCommand,
	type: 'Information'
};
