import { Guild, NonThreadGuildBasedChannel } from 'discord.js';

export const fetchDiscordChannel = async (guild: Guild, channelID: string): Promise<NonThreadGuildBasedChannel> => {
	if (channelID.length === 0) {
		return null;
	}

	try {
		const channel = await guild.channels.fetch(channelID);
		return channel;
	}
	catch {
		return null;
	}
};
