import { mongodb } from '../../api/mongo.js';

export const fetchIgnoredChannels = async (guildId: string): Promise<Array<string>> => {
	let guildConfig = await mongodb.guildConfig.findOne({
		guildID: guildId
	});

	if (guildConfig === null) {
		guildConfig = await mongodb.guildConfig.create({
			guildID: guildId
		});
	}

	return guildConfig.ignoredChannelIDs;
};
