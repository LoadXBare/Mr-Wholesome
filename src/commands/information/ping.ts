import { AttachmentBuilder, EmbedBuilder, inlineCode } from 'discord.js';
import ImageCharts from 'image-charts';
import { cache } from '../../config/cache.js';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { fetchUptime } from '../../lib/misc/fetch-uptime.js';
import { storeAttachment } from '../../lib/misc/store-attachments.js';
import { config } from '../../private/config.js';

const pingCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const uptime = fetchUptime();
	const uptimeText = `${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes & ${uptime.seconds} seconds`;
	const wsPingHistory = await cache.fetch('wsPingHistory');

	const historyGraph = new ImageCharts()
		.cht('lc')
		.chd(`t:${wsPingHistory.join(',')}`)
		.chs('600x300')
		.chxt('y')
		.chds('a')
		.chls('4')
		.chco('32f032cc')
		.chm('B,32c83266,0,0,0')
		.chf('a,s,00000000')
		.chxs('0N**ms,969696')
		.chtt('Latency')
		.chts('969696,20');

	const buffer = await historyGraph.toBuffer();
	const reply = await message.reply({ content: 'uwu' });
	const historyGraphURL = await storeAttachment(new AttachmentBuilder(buffer), message.client);

	const pingCommand = new EmbedBuilder()
		.setTitle('Tweet!')
		.setDescription(`⌛ ⇒ ${inlineCode(`${reply.createdTimestamp - message.createdTimestamp}ms`)}\
		\n☁️ ⇒ ${inlineCode(`${message.client.ws.ping}ms`)}\
		\n⏱️ ⇒ ${inlineCode(uptimeText)}\
		\n${config.botEmotes.memory} ⇒ ${inlineCode(`${(process.memoryUsage().rss / (1024 * 1024)).toFixed(2)} MB`)}`)
		.setImage(historyGraphURL)
		.setFooter({ text: 'Latency graph updated every 5 minutes.' })
		.setColor(COLORS.COMMAND);

	reply.edit({ content: null, embeds: [pingCommand] });
};

export const ping: Command = {
	devOnly: false,
	modOnly: false,
	run: pingCommand,
	type: 'Information'
};
