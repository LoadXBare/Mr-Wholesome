import { GuildRanking } from '../index.js';
import { mongodb } from './mongo.js';

export const fetchMemberRanking = async (guildID: string, memberID: string): Promise<GuildRanking> => {
	let memberRanking = await mongodb.guildRanking.findOne({
		guildID: guildID,
		memberID: memberID
	});

	if (memberRanking === null) {
		const newMemberObject: GuildRanking = {
			guildID: guildID,
			memberID: memberID,
			xp: 0,
			xpLevel: 0,
			levelUpNotifications: true,
			credits: 0
		};

		memberRanking = await mongodb.guildRanking.create(newMemberObject);
	}

	const memberRankingFormatted: GuildRanking = {
		guildID: memberRanking.guildID,
		memberID: memberRanking.memberID,
		xp: memberRanking.xp,
		xpLevel: memberRanking.xpLevel,
		levelUpNotifications: memberRanking.levelUpNotifications,
		credits: memberRanking.credits
	};

	return memberRankingFormatted;
};

export const updateMemberRanking = async (data: GuildRanking): Promise<void> => {
	await mongodb.guildRanking.updateOne({
		guildID: data.guildID,
		memberID: data.memberID
	}, data);
};
