import * as Canvas from '@napi-rs/canvas';
import { AttachmentBuilder, GuildMember, inlineCode, quote } from 'discord.js';
import { request } from 'undici';
import { fetchMemberRanking } from '../../api/guild-ranking.js';
import { BotCommand, Command, GuildRanking, XPLevelBounds } from '../../index.js';
import { fetchMemberLeaderboardPosition } from '../../lib/guild-ranking/handler.js';
import { fetchXPLevelBounds } from '../../lib/guild-ranking/xp-level.js';
import { fetchGuildMember } from '../../lib/misc/fetch-guild-member.js';
import { sendError } from '../../lib/misc/send-error.js';

const findFontSize = (canvas: Canvas.Canvas, text: string, maxFontSize: number, maxTextWidth: number): string => {
	const ctx = canvas.getContext('2d');
	let fontSize = maxFontSize;

	do {
		ctx.font = `${fontSize}px ubuntu-medium`;
		fontSize = parseFloat((fontSize - 0.05).toFixed(2));
	} while (ctx.measureText(text).width > maxTextWidth);

	return ctx.font;
};

const checkRankCommand = async (args: BotCommand): Promise<void> => {
	const { commandArgs, message } = args;

	let memberRanking: GuildRanking;
	let xpLevelBounds: XPLevelBounds;
	let memberLeaderboardPos: number;
	let member: GuildMember;
	if (commandArgs.length === 0) {
		member = message.member;
		memberRanking = await fetchMemberRanking(message.guildId, message.author.id);
		xpLevelBounds = fetchXPLevelBounds(memberRanking.xpLevel);
		memberLeaderboardPos = await fetchMemberLeaderboardPosition(member);
	}
	else {
		const memberText = commandArgs.shift() ?? 'undefined';
		const memberID = memberText.replace(/\D/g, '');

		member = await fetchGuildMember(message.guild, memberID);
		if (member === null) {
			sendError(message, `${inlineCode(memberText)} is not a valid User!`);
			return;
		}

		memberRanking = await fetchMemberRanking(message.guildId, member.id);
		xpLevelBounds = fetchXPLevelBounds(memberRanking.xpLevel);
		memberLeaderboardPos = await fetchMemberLeaderboardPosition(member);
	}

	// Create canvas
	const canvas = Canvas.createCanvas(823, 274);
	Canvas.GlobalFonts.registerFromPath('./assets/Ubuntu-Medium.ttf', 'ubuntu-medium');
	const ctx = canvas.getContext('2d');

	// Draw background
	const background = await Canvas.loadImage('./assets/rank_card_background.png');
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

	// Draw member's profile picture
	const { body } = await request(member.displayAvatarURL({ extension: 'png' }));
	const avatar = await Canvas.loadImage(await body.arrayBuffer());
	ctx.beginPath();
	ctx.arc(160, 135, 110, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.save();
	ctx.clip();
	ctx.fillStyle = '#FFFFFF55';
	ctx.fillRect(50, 25, 220, 220);
	ctx.drawImage(avatar, 50, 25, 220, 220);
	ctx.lineWidth = 8;
	ctx.strokeStyle = '#FFFFFF';
	ctx.stroke();
	ctx.restore();

	// Draw progress bar
	const progressPercent = Math.round(((memberRanking.xp - xpLevelBounds.lower) / (xpLevelBounds.upper - xpLevelBounds.lower)) * 100);
	const progressBar = await Canvas.loadImage('./assets/rank-card-progress-bar.png');
	ctx.fillStyle = '#00FF66';
	ctx.fillRect(337, 172, progressPercent * 4, 33);
	ctx.drawImage(progressBar, 0, 0, canvas.width, canvas.height);

	// Draw text
	const leftBoundary = 336;
	const centerBoundary = 536;
	const rightBoundary = 736;
	const buffer = 20;

	ctx.fillStyle = '#FFFFFF';
	ctx.font = '40px ubuntu-medium';
	ctx.textAlign = 'right';
	ctx.fillText(`#${memberLeaderboardPos}`, rightBoundary, 75);

	ctx.textAlign = 'left';
	ctx.font = findFontSize(canvas, member.displayName, 40, rightBoundary - leftBoundary - ctx.measureText(`#${memberLeaderboardPos}`).width - buffer);
	ctx.fillText(member.displayName, leftBoundary, 75);

	ctx.font = '30px ubuntu-medium';
	ctx.textAlign = 'center';
	ctx.fillText(`${progressPercent}%`, centerBoundary, 200);

	ctx.font = '20px ubuntu-medium';
	ctx.textAlign = 'left';
	ctx.fillText(`${memberRanking.xp - xpLevelBounds.lower} / ${xpLevelBounds.upper - xpLevelBounds.lower} XP`, leftBoundary, 155);

	ctx.textAlign = 'right';
	ctx.fillText(`Level ${memberRanking.xpLevel}`, rightBoundary, 155);

	ctx.textAlign = 'left';
	ctx.fillText('Total XP', leftBoundary, 235);

	ctx.textAlign = 'right';
	ctx.fillText(memberRanking.xp.toString(), rightBoundary, 235);

	const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'rank-card.png' });

	message.reply({ content: quote(`Viewing rank card • [ ${member.user.tag} ]`), files: [attachment] });
};

export const checkRank: Command = {
	devOnly: false,
	modOnly: false,
	run: checkRankCommand,
	type: 'Ranking'
};
