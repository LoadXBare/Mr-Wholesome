import { Chance } from 'chance';
import dayjs from 'dayjs';
import { EmbedBuilder, Message } from 'discord.js';
import { BotCommand, Command } from '../..';
import { updateMemberRanking } from '../../api/guild-ranking.js';
import { COLORS, ZERO_WIDTH_SPACE } from '../../config/constants.js';
import { sleep } from '../../lib/misc/sleep.js';
import { config } from '../../private/config.js';
import { channelIsBotSpam } from '../ranking/leaderboard.js';

const generateStarRating = (starRating: number, starCount: number): string => {
	const rating = Math.round(starRating * 2) / 2;
	const fullStarCount = Math.floor(Math.abs(rating));
	const halfStarCount = Math.abs(rating) % 1 === 0.5 ? 1 : 0;
	const emptyStarCount = starCount - fullStarCount - halfStarCount;
	const negative = rating < 0;

	let starRatingString = '';
	if (negative) {
		starRatingString = `${config.botEmotes.starBlackFull.repeat(fullStarCount)}${config.botEmotes.starBlackHalfFull.repeat(halfStarCount)}${config.botEmotes.starBlackEmpty.repeat(emptyStarCount)}`;
	} else {
		starRatingString = `${config.botEmotes.starFull.repeat(fullStarCount)}${config.botEmotes.starHalfFull.repeat(halfStarCount)}${config.botEmotes.starEmpty.repeat(emptyStarCount)}`;
	}

	return starRatingString;
};

const dailyReadingIchiCommand = async (message: Message): Promise<void> => {
	const dateToday = dayjs();
	const seed = `${dateToday}${message.author.id}`;
	const chance = new Chance(seed);

	const loveRating = chance.integer({ min: -20, max: 0 }) / 2;
	const luckRating = chance.integer({ min: -20, max: 0 }) / 2;
	const successRating = chance.integer({ min: -20, max: 0 }) / 2;
	const wealthRating = chance.integer({ min: -20, max: 0 }) / 2;
	const overallRating = (successRating + luckRating + loveRating + wealthRating) / 4;
	const resetXP = overallRating === -10;

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
	await sleep(2_000);

	readingEmbed
		.setDescription('**Please Wait**\
		\nQuerying bird gods...');
	reply.edit({ embeds: [readingEmbed] });
	await sleep(2_000);

	readingEmbed
		.setDescription('**Please Wait**\
		\nAlmost done, finalising results...');
	reply.edit({ embeds: [readingEmbed] });
	await sleep(2_000);

	readingEmbed
		.setDescription('**Done!** Here is your reading for today...')
		.setFields([
			{
				name: 'Overall',
				value: `${generateStarRating(overallRating, 10)} ${(Math.round(overallRating * 2) / 2)}/10`
			},
			{
				name: ZERO_WIDTH_SPACE,
				value: ZERO_WIDTH_SPACE
			},
			{
				name: 'Love',
				value: `${generateStarRating(loveRating, 10)} ${loveRating}/0`,
				inline: true
			},
			{
				name: 'Luck',
				value: `${generateStarRating(luckRating, 10)} ${luckRating}/0`,
				inline: true
			},
			{
				name: 'Success',
				value: `${generateStarRating(successRating, 10)} ${successRating}/0`,
				inline: true
			},
			{
				name: 'Wealth',
				value: `${generateStarRating(wealthRating, 10)} ${wealthRating}/0`,
				inline: true
			}
		])
		.setThumbnail(null)
		.setFooter({ text: `${resetXP ? 'Uh oh, you may wanna check your XP.. 💥' : 'Hmmm, not a perfect -10, you\'re safe... for today...'}` });

	if (resetXP) {
		await updateMemberRanking({
			credits: 0,
			guildID: message.guildId,
			levelUpNotifications: true,
			memberID: message.author.id,
			xp: 0,
			xpLevel: 0
		});
	}

	reply.edit({ embeds: [readingEmbed] });
};

const dailyReadingCommand = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	if (!channelIsBotSpam(message)) return;

	const authorIsIchi = message.author.id === config.userIDs.Ichi;
	if (authorIsIchi) {
		dailyReadingIchiCommand(message);
		return;
	}

	const dateToday = dayjs().format('DDMMYYYY');
	const seed = `${dateToday}${message.author.id}`;
	const chance = new Chance(seed);

	const loveRating = chance.integer({ min: -10, max: 10 }) / 2;
	const luckRating = chance.integer({ min: -10, max: 10 }) / 2;
	const successRating = chance.integer({ min: -10, max: 10 }) / 2;
	const wealthRating = chance.integer({ min: -10, max: 10 }) / 2;
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
	await sleep(2_000);

	readingEmbed
		.setDescription('**Please Wait**\
		\nQuerying bird gods...');
	reply.edit({ embeds: [readingEmbed] });
	await sleep(2_000);

	readingEmbed
		.setDescription('**Please Wait**\
		\nAlmost done, finalising results...');
	reply.edit({ embeds: [readingEmbed] });
	await sleep(2_000);

	readingEmbed
		.setDescription('**Done!** Here is your reading for today...')
		.setFields([
			{
				name: 'Overall',
				value: `${generateStarRating(overallRating, 5)} ${(Math.round(overallRating * 2) / 2)}/5`
			},
			{
				name: ZERO_WIDTH_SPACE,
				value: ZERO_WIDTH_SPACE
			},
			{
				name: 'Love',
				value: `${generateStarRating(loveRating, 5)} ${loveRating}/5`,
				inline: true
			},
			{
				name: 'Luck',
				value: `${generateStarRating(luckRating, 5)} ${luckRating}/5`,
				inline: true
			},
			{
				name: 'Success',
				value: `${generateStarRating(successRating, 5)} ${successRating}/5`,
				inline: true
			},
			{
				name: 'Wealth',
				value: `${generateStarRating(wealthRating, 5)} ${wealthRating}/5`,
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
