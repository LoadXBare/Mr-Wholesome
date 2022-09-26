import { Chance } from 'chance';
import dayjs from 'dayjs';
import { EmbedBuilder } from 'discord.js';
import { BotCommand, Command } from '../..';
import { COLORS, ZERO_WIDTH_SPACE } from '../../config/constants.js';
import { sleep } from '../../lib/misc/sleep.js';
import { config } from '../../private/config.js';
import { channelIsBotSpam } from '../ranking/leaderboard.js';

const generateStarRating = (authorIsIchi: boolean, starRating: number, starCount: number): string => {
	const rating = Math.round(starRating * 2) / 2;
	const fullStarCount = Math.floor(rating);
	const halfStarCount = rating % 1 === 0.5 ? 1 : 0;
	const emptyStarCount = starCount - fullStarCount - halfStarCount;

	let starRatingString = '';
	if (authorIsIchi) {
		starRatingString = `${config.botEmotes.starBlackFull.repeat(fullStarCount)}${config.botEmotes.starBlackHalfFull.repeat(halfStarCount)}${config.botEmotes.starBlackEmpty.repeat(emptyStarCount)}`;
	} else {
		starRatingString = `${config.botEmotes.starFull.repeat(fullStarCount)}${config.botEmotes.starHalfFull.repeat(halfStarCount)}${config.botEmotes.starEmpty.repeat(emptyStarCount)}`;
	}

	return starRatingString;
};

const dailyReadingCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	if (!channelIsBotSpam(message)) return;

	const authorIsIchi = message.author.id === config.userIDs.Ichi;
	const dateToday = dayjs().format('DDMMYYYY');
	const seed = `${dateToday}${message.author.id}`;
	const chance = new Chance(seed);

	const loveRating = chance.natural({ min: 1, max: 10 }) / 2;
	const luckRating = chance.natural({ min: 1, max: 10 }) / 2;
	const successRating = chance.natural({ min: 1, max: 10 }) / 2;
	const wealthRating = chance.natural({ min: 1, max: 10 }) / 2;
	const overallRating = (successRating + luckRating + loveRating + wealthRating) / 4;

	const readingEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.author.displayAvatarURL()
		})
		.setTitle(`Daily Reading for ${message.member.displayName}`)
		.setDescription('**Please Wait**\
		\nContacting spirits...')
		.setThumbnail(config.botEmoteUrls.loading)
		.setColor(COLORS.COMMAND);

	const reply = await message.reply({ embeds: [readingEmbed] });
	await sleep(3_000);

	readingEmbed
		.setDescription('**Please Wait**\
		\nQuerying bird gods...');
	reply.edit({ embeds: [readingEmbed] });
	await sleep(3_000);

	readingEmbed
		.setDescription('**Please Wait**\
		\nAlmost done, finalising results...');
	reply.edit({ embeds: [readingEmbed] });
	await sleep(3_000);

	readingEmbed
		.setDescription('**Done!** Here is your reading for today...')
		.setFields([
			{
				name: 'Overall',
				value: `${generateStarRating(authorIsIchi, overallRating, 5)} ${(Math.round(overallRating * 2) / 2) * (authorIsIchi ? -1 : 1)}/5`
			},
			{
				name: ZERO_WIDTH_SPACE,
				value: ZERO_WIDTH_SPACE
			},
			{
				name: 'Love',
				value: `${generateStarRating(authorIsIchi, loveRating, 5)} ${authorIsIchi ? loveRating * -1 : loveRating}/5`,
				inline: true
			},
			{
				name: 'Luck',
				value: `${generateStarRating(authorIsIchi, luckRating, 5)} ${authorIsIchi ? luckRating * -1 : luckRating}/5`,
				inline: true
			},
			{
				name: 'Success',
				value: `${generateStarRating(authorIsIchi, successRating, 5)} ${authorIsIchi ? successRating * -1 : successRating}/5`,
				inline: true
			},
			{
				name: 'Wealth',
				value: `${generateStarRating(authorIsIchi, wealthRating, 5)} ${authorIsIchi ? wealthRating * -1 : wealthRating}/5`,
				inline: true
			}
		])
		.setThumbnail(null);

	reply.edit({ embeds: [readingEmbed] });
};

export const reading: Command = {
	devOnly: false,
	modOnly: false,
	run: dailyReadingCommand,
	type: 'Fun'
};
