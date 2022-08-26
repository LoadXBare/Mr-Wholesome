import dayjs from 'dayjs';
import { Message } from 'discord.js';
import { fetchMemberStats, updateMemberStats } from '../../api/member-stats.js';
import { MemberStats } from '../../index.js';

export const handleMemberStats = async (message: Message): Promise<void> => {
	const memberStats = await fetchMemberStats(message.guildId, message.author.id);

	const messageCountByHour = memberStats.messageCountByHour;
	messageCountByHour[dayjs().utc().hour()] += 1;

	const newMemberStatsObject: MemberStats = {
		guildID: memberStats.guildID,
		memberID: memberStats.memberID,
		messageCount: memberStats.messageCount + 1,
		messageCountByHour: messageCountByHour
	};

	await updateMemberStats(newMemberStatsObject);
};

