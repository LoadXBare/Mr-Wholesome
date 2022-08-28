import { GuildMember, Message } from 'discord.js';
import { fetchMemberRanking, updateMemberRanking } from '../../api/guild-ranking.js';
import { mongodb } from '../../api/mongo.js';
import { creditsPerMessage, xpPerMessage } from '../../config/constants.js';
import { GuildRanking } from '../../index.js';
import { randomNumber } from '../misc/random-number.js';
import { fetchXPLevel, handleLevelUp } from './xp-level.js';

export const fetchMemberLeaderboardPosition = async (member: GuildMember): Promise<number> => {
	const allMemberRankings = await mongodb.guildRanking.find({
		guildID: member.guild.id
	}).sort({ xp: 'descending' });


	for (const memberRank of allMemberRankings) {
		const index = allMemberRankings.indexOf(memberRank);
		if (memberRank.memberID === member.id) {
			return index + 1;
		}
	}
};

export const handleGuildRanking = async (message: Message): Promise<void> => {
	const guildConfig = await mongodb.guildConfig.findOne({
		guildID: message.guildId
	});
	if (guildConfig === null || guildConfig.guildRankingIgnoredChannelIDs.includes(message.channelId)) {
		return;
	}

	const memberRanking = await fetchMemberRanking(message.guildId, message.author.id);

	const newMemberXP = memberRanking.xp + randomNumber(xpPerMessage.min, xpPerMessage.max);
	const newMemberCredits = memberRanking.credits + randomNumber(creditsPerMessage.min, creditsPerMessage.max);
	const newMemberLevel = fetchXPLevel(newMemberXP);

	if (memberRanking.xpLevel !== newMemberLevel) {
		handleLevelUp(message, newMemberLevel);
	}

	const newMemberObject: GuildRanking = {
		guildID: message.guildId,
		memberID: message.author.id,
		xp: newMemberXP,
		xpLevel: newMemberLevel,
		levelUpNotifications: memberRanking.levelUpNotifications,
		credits: newMemberCredits
	};

	await updateMemberRanking(newMemberObject);
};
