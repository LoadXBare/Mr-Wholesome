import { MemberStats } from '../index.js';
import { mongodb } from './mongo.js';

export const fetchMemberStats = async (guildID: string, memberID: string): Promise<MemberStats> => {
	let memberStats = await mongodb.memberStats.findOne({
		guildID: guildID,
		memberID: memberID
	});

	if (memberStats === null) {
		memberStats = await mongodb.memberStats.create({
			guildID: guildID,
			memberID: memberID,
			messageCount: 0,
			messageCountByHour: {
				'0': 0,
				'1': 0,
				'2': 0,
				'3': 0,
				'4': 0,
				'5': 0,
				'6': 0,
				'7': 0,
				'8': 0,
				'9': 0,
				'10': 0,
				'11': 0,
				'12': 0,
				'13': 0,
				'14': 0,
				'15': 0,
				'16': 0,
				'17': 0,
				'18': 0,
				'19': 0,
				'20': 0,
				'21': 0,
				'22': 0,
				'23': 0
			}
		});
	}

	const memberStatsFormatted: MemberStats = {
		guildID: memberStats.guildID,
		memberID: memberStats.memberID,
		messageCount: memberStats.messageCount,
		messageCountByHour: {
			'0': memberStats.messageCountByHour[0],
			'1': memberStats.messageCountByHour[1],
			'2': memberStats.messageCountByHour[2],
			'3': memberStats.messageCountByHour[3],
			'4': memberStats.messageCountByHour[4],
			'5': memberStats.messageCountByHour[5],
			'6': memberStats.messageCountByHour[6],
			'7': memberStats.messageCountByHour[7],
			'8': memberStats.messageCountByHour[8],
			'9': memberStats.messageCountByHour[9],
			'10': memberStats.messageCountByHour[10],
			'11': memberStats.messageCountByHour[11],
			'12': memberStats.messageCountByHour[12],
			'13': memberStats.messageCountByHour[13],
			'14': memberStats.messageCountByHour[14],
			'15': memberStats.messageCountByHour[15],
			'16': memberStats.messageCountByHour[16],
			'17': memberStats.messageCountByHour[17],
			'18': memberStats.messageCountByHour[18],
			'19': memberStats.messageCountByHour[19],
			'20': memberStats.messageCountByHour[20],
			'21': memberStats.messageCountByHour[21],
			'22': memberStats.messageCountByHour[22],
			'23': memberStats.messageCountByHour[23]
		}
	};

	return memberStatsFormatted;
};

export const updateMemberStats = async (data: MemberStats): Promise<void> => {
	await mongodb.memberStats.updateOne({
		guildID: data.guildID,
		memberID: data.memberID
	}, data);
};
