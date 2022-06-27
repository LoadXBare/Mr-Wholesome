import { Client, TextChannel } from 'discord.js';
import { mongodb } from '../../api/mongo.js';

export const fetchLogChannel = async (guildId: string, client: Client): Promise<null | TextChannel> => {
	let guildConfig = await mongodb.guildConfig.findOne({
		guildID: guildId
	});

	if (guildConfig === null) {
		guildConfig = await mongodb.guildConfig.create({
			guildID: guildId
		});
	}

	try {
		const logChannel = await client.channels.fetch(guildConfig.logChannelID) as TextChannel;
		return logChannel;
	}
	catch {
		return null;
	}
};
