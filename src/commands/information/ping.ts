import { AttachmentBuilder, EmbedBuilder, inlineCode } from 'discord.js';
import ImageCharts from 'image-charts';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { fetchUptime } from '../../lib/misc/fetch-uptime.js';
import { storeAttachment } from '../../lib/misc/store-attachments.js';
import { wsPingHistory } from '../../lib/scheduler.js';

const pingCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const uptime = fetchUptime();
	const uptimeText = `${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes & ${uptime.seconds} seconds`;

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

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore .toFile() does exist, just not within image-charts' index.d.ts file
	await historyGraph.toFile('./temp.png');

	const reply = await message.reply({ content: 'uwu' });
	const historyGraphURL = await storeAttachment(new AttachmentBuilder('./temp.png'), message.client);

	const pingCommand = new EmbedBuilder()
		.setTitle('Tweet!')
		.setDescription(`⌛ ⇒ ${inlineCode(`${reply.createdTimestamp - message.createdTimestamp}ms`)}\
		\n☁️ ⇒ ${inlineCode(`${message.client.ws.ping}ms`)}\
		\n⏱️ ⇒ ${inlineCode(uptimeText)}`)
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
