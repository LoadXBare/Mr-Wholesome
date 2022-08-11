import { ChannelType, Guild, TextChannel } from 'discord.js';

export const fetchDiscordTextChannel = async (guild: Guild, channelID: string): Promise<TextChannel> => {
	if (channelID.length === 0) {
		return null;
	}

	try {
		const channel = await guild.channels.fetch(channelID);
		if (channel.type !== ChannelType.GuildText) {
			return null;
		}
		return channel;
	}
	catch {
		return null;
	}
};
