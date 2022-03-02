import prisma from '../../prisma/client.js';

export const fetchIgnoredChannels = async (guildId: string): Promise<Array<string>> => {
	const guildConfig = await prisma.guildConfig.upsert({
		where: { guildId: guildId },
		update: {},
		create: { guildId }
	});

	return JSON.parse(guildConfig.ignoredChannels);
};
