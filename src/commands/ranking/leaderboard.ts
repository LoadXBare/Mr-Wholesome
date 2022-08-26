import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import ImageCharts from 'image-charts';
import { fetchMemberRanking } from '../../api/guild-ranking.js';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { fetchMemberLeaderboardPosition } from '../../lib/guild-ranking/handler.js';
import { fetchGuildMember } from '../../lib/misc/fetch-guild-member.js';
import { sendError } from '../../lib/misc/send-error.js';
import { storeAttachment } from '../../lib/misc/store-attachments.js';

interface LeaderboardChart {
	chco: string,
	chd: string,
	chl: string,
	chxl: string
}

const leaderboardCommand = async (args: BotCommand): Promise<void> => {
	const { message, commandArgs } = args;

	const userEnteredPage = parseInt(commandArgs.shift() ?? 'undefined');
	const authorRanking = await fetchMemberRanking(message.guildId, message.author.id);
	const authorLeaderboardPos = await fetchMemberLeaderboardPosition(message.member);
	const allMemberRankings = await mongodb.guildRanking.find({
		guildID: message.guildId
	}).sort({ xp: 'descending' });


	let page = 1;
	if (!isNaN(userEnteredPage)) {
		page = userEnteredPage;
	}

	const memberRankingsList = allMemberRankings.slice((page - 1) * 10, page * 10);

	const chart: LeaderboardChart = {
		chco: '',
		chd: 't:',
		chl: '',
		chxl: '0:|'
	};

	for (const memberRanking of memberRankingsList) {
		if (memberRanking.xp === 0) {
			continue;
		}
		const index = memberRankingsList.indexOf(memberRanking);
		const member = await fetchGuildMember(message.guild, memberRanking.memberID);
		if (memberRanking.memberID === message.author.id) {
			chart.chco = chart.chco.concat('d703fc|');
		}
		else {
			chart.chco = chart.chco.concat('aaaaaa|');
		}

		chart.chd = chart.chd.concat(`${memberRanking.xp},`);
		chart.chl = chart.chl.concat(`${member.displayName} - ${memberRanking.xp} XP|`);
		chart.chxl = chart.chxl.concat(`#${(memberRankingsList.length - index) + (page - 1) * 10}|`);
	}

	if (chart.chco.length === 0) {
		sendError(message, `There are no members to display on leaderboard page ${page}!`);
		return;
	}

	chart.chco = chart.chco.slice(0, -1);
	chart.chd = chart.chd.slice(0, -1);
	chart.chl = chart.chl.slice(0, -1);
	chart.chxl = chart.chxl.slice(0, -1);


	const leaderboardGraph = new ImageCharts()
		.chbr('10')
		.chco(chart.chco)
		.chd(chart.chd)
		.chds('0,1')
		.chf('a,s,00000000')
		.chl(chart.chl)
		.chlps('anchor,end|align,left|padding.right,10')
		.chs('600x300')
		.cht('bhg')
		.chxl(chart.chxl)
		.chxr('1,0,1')
		.chxs('0,969696')
		.chxt('y');

	const buffer = await leaderboardGraph.toBuffer();
	const leaderboardGraphURL = await storeAttachment(new AttachmentBuilder(buffer), message.client);

	const leaderboardEmbed = new EmbedBuilder()
		.setTitle(`Viewing server rankings for ${message.guild.name}`)
		.setThumbnail(message.guild.iconURL())
		.setDescription(`**Your Rank**\
			\nYou are rank **#${authorLeaderboardPos}** on this server with a total of **${authorRanking.xp} XP**`)
		.setImage(leaderboardGraphURL)
		.setFooter({ text: `Page ${page} • Type "${BOT_PREFIX}top ${page + 1}" to go to page ${page + 1} of the leaderboard` })
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [leaderboardEmbed] });
};

export const leaderboard: Command = {
	devOnly: false,
	modOnly: false,
	run: leaderboardCommand,
	type: 'Ranking'
};
