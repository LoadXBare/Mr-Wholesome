import * as Canvas from '@napi-rs/canvas';
import { AttachmentBuilder, EmbedBuilder, Message } from 'discord.js';
import { fetchMemberRanking } from '../../api/guild-ranking.js';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { fetchMemberLeaderboardPosition } from '../../lib/guild-ranking/handler.js';
import { fetchGuildMember } from '../../lib/misc/fetch-guild-member.js';
import { sendError } from '../../lib/misc/send-error.js';
import { findFontSize } from './rank.js';

export const channelIsBotSpam = (message: Message): boolean => message.channelId === '821974301598285836';

const leaderboardCommand = async (args: BotCommand): Promise<void> => {
	const { message, commandArgs } = args;
	if (!channelIsBotSpam(message)) return;

	const userEnteredPage = parseInt(commandArgs.shift() ?? 'undefined');
	const authorRanking = await fetchMemberRanking(message.guildId, message.author.id);
	const authorLeaderboardPos = await fetchMemberLeaderboardPosition(message.member);
	const allMemberRankings = await mongodb.guildRanking.find({
		guildID: message.guildId
	}).sort({ xp: 'descending' });

	let page = 1;
	const maxPages = Math.ceil(allMemberRankings.length / 10);
	if (!isNaN(userEnteredPage)) {
		page = userEnteredPage;
	}

	const memberRankingsList = allMemberRankings.slice((page - 1) * 10, page * 10);
	if (memberRankingsList.length === 0) {
		sendError(message, `There are no users to display on leaderboard page ${page}!`);
		return;
	}

	// Create canvas
	const canvas = Canvas.createCanvas(720, 731);
	Canvas.GlobalFonts.registerFromPath('./assets/Ubuntu-Medium.ttf', 'ubuntu-medium');
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('./assets/leaderboard-background.png');
	ctx.drawImage(background, 0, 0);

	let barY = 0;
	const leftBoundary = 20;
	const rightBoundary = canvas.width - leftBoundary;
	for (const member of memberRankingsList) {
		ctx.font = '30px ubuntu-medium';
		const leaderboardPos = memberRankingsList.indexOf(member) + (page - 1) * 10 + 1;
		const guildMember = await fetchGuildMember(message.guild, member.memberID);
		const positionLengthInPixels = ctx.measureText(`#${leaderboardPos}`).width + 10;

		if (!guildMember) continue;

		// Draw leaderboard bar
		let bar: Canvas.Image;
		if (guildMember.id === message.author.id)
			bar = await Canvas.loadImage('./assets/leaderboard-member-highlighted.png');
		else
			bar = await Canvas.loadImage('./assets/leaderboard-member.png');
		ctx.drawImage(bar, 0, barY);

		// Draw leaderboard position
		if (leaderboardPos === 1) ctx.fillStyle = '#FFDF00';
		else if (leaderboardPos === 2) ctx.fillStyle = '#D3D3D3';
		else if (leaderboardPos === 3) ctx.fillStyle = '#CD7F32';
		else ctx.fillStyle = '#FFFFFF';
		ctx.fillText(`#${leaderboardPos}`, leftBoundary, barY + 43);

		// Draw leaderboard dot
		ctx.fillStyle = '#00000066';
		ctx.fillText('•', leftBoundary + positionLengthInPixels, barY + 43);

		// Draw member XP
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'right';
		ctx.fillText(`${member.xp} XP`, rightBoundary, barY + 43);

		// Draw leaderboard member name
		ctx.textAlign = 'left';
		ctx.font = findFontSize(canvas, guildMember.displayName, 30, (rightBoundary - ctx.measureText(`${member.xp} XP`).width) - (leftBoundary + positionLengthInPixels + ctx.measureText('•').width + 10) - 20);
		ctx.fillText(guildMember.displayName, leftBoundary + positionLengthInPixels + ctx.measureText('•').width + 10, barY + 43);

		barY = barY + bar.height + 9;
	}

	const leaderboardAttachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'leaderboard.png' });
	const leaderboardEmbed = new EmbedBuilder()
		.setTitle(`Viewing server rankings for ${message.guild.name}`)
		.setThumbnail(message.guild.iconURL())
		.setDescription(`**Your Rank**\
			\nYou are rank **#${authorLeaderboardPos}** on this server with a total of **${authorRanking.xp} XP**`)
		.setImage('attachment://leaderboard.png')
		.setFooter({ text: `Page ${page} / ${maxPages} • Type "${BOT_PREFIX}top ${page + 1}" to go to page ${page + 1} of the leaderboard` })
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [leaderboardEmbed], files: [leaderboardAttachment] });
};

export const leaderboard: Command = {
	devOnly: false,
	modOnly: false,
	run: leaderboardCommand,
	type: 'Ranking'
};
