import prisma from '../../prisma/client.js';

/**
 * Fetches and returns an array of Ignored Channel IDs for the specified Guild ID.
 * 
 * @param guildId The Guild ID to fetch Ignored Channels for.
 */
export const fetchIgnoredChannels = async (guildId: string): Promise<Array<string>> => {
	const guildConfig = await prisma.guildConfig.upsert({
		where: { guildId: guildId },
		update: {},
		create: { guildId }
	});

	return JSON.parse(guildConfig.ignoredChannels);
};
