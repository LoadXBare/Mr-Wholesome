import { EmbedBuilder, Message, userMention } from 'discord.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { XPLevelBounds } from '../../index.js';
import { config } from '../../private/config.js';
import { fetchDiscordTextChannel } from '../misc/fetch-discord-text-channel.js';

const FORMULA = (l: number): number => Math.round(Math.pow(l, 1.75) * 200);

export const fetchXPLevel = (xp: number): number => {
	let currentLevel = 0;
	while (currentLevel < 9999) {
		const xpRequired = FORMULA(currentLevel);

		if (xp < xpRequired) {
			break;
		}

		currentLevel += 1;
	}

	return currentLevel - 1;
};

export const fetchXPLevelBounds = (level: number): XPLevelBounds => {
	const lowerBound = FORMULA(level);
	const upperBound = FORMULA(level + 1);

	const xpLevelBounds = {
		lower: lowerBound,
		upper: upperBound
	};

	return xpLevelBounds;
};

export const handleLevelUp = async (message: Message, level: number): Promise<void> => {
	const xpLevelUpNotificationChannel = await fetchDiscordTextChannel(message.guild, config.channelIDs.xpLevelUpNotifications);
	if (xpLevelUpNotificationChannel === null) {
		return;
	}

	const xpLevelUpEmbed = new EmbedBuilder()
		.setThumbnail(message.member.displayAvatarURL())
		.setTitle('Level Up!')
		.setDescription(`You have leveled up to **Level ${level}**!`)
		.setFooter({ text: `For more info, type "${BOT_PREFIX}rank"` })
		.setColor(COLORS.POSITIVE);

	xpLevelUpNotificationChannel.send({ content: userMention(message.author.id), embeds: [xpLevelUpEmbed] });
};
