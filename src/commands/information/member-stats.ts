import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import ImageCharts from 'image-charts';
import { fetchMemberStats } from '../../api/member-stats.js';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { storeAttachment } from '../../lib/misc/store-attachments.js';

const memberStatsCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const memberStats = await fetchMemberStats(message.guildId, message.author.id);

	let chartData = 't:';
	for (const [, value] of Object.entries(memberStats.messageCountByHour)) {
		chartData = chartData.concat(`${value},`);
	}
	chartData = chartData.slice(0, -1);

	const statsGraph = new ImageCharts()
		.chbr('15')
		.chco('FF7B00')
		.chd(chartData)
		.chds('a')
		.chf('a,s,00000000')
		.chl(chartData.replace(/,/g, '|').slice(2))
		.chlps('anchor,end|align,top|color,969696')
		.chs('999x600')
		.cht('bvg')
		.chts('969696,20')
		.chtt('Message Count by UTC Hour')
		.chxl('0:|12am|1am|2am|3am|4am|5am|6am|7am|8am|9am|10am|11am|12pm|1pm|2pm|3pm|4pm|5pm|6pm|7pm|8pm|9pm|10pm|11pm')
		.chxs('0,969696')
		.chxt('x');

	const buffer = await statsGraph.toBuffer();
	const statsGraphURL = await storeAttachment(new AttachmentBuilder(buffer), message.client);

	const statsEmbed = new EmbedBuilder()
		.setTitle(`Viewing stats for ${message.author.tag}`)
		.setThumbnail(message.member.displayAvatarURL())
		.setDescription(`**Total Message Count:** ${memberStats.messageCount}`)
		.setImage(statsGraphURL)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [statsEmbed] });
};

export const memberStats: Command = {
	devOnly: false,
	modOnly: false,
	run: memberStatsCommand,
	type: 'Information'
};
