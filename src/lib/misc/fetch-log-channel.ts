import { Client, TextChannel } from 'discord.js';
import prisma from '../../prisma/client.js';

/**
 * Fetches and returns a Text Channel object (or null) for the Log Channel for the specified Guild ID.
 * 
 * @param guildId The Guild ID to fetch the Log Channel for.
 * @param client The bot client.
 */

export const fetchLogChannel = async (guildId: string, client: Client) => {
	const guildConfig = await prisma.guildConfig.upsert({
		where: { guildId: guildId },
		update: {},
		create: { guildId: guildId }
	});

	try { await client.channels.fetch(guildConfig.logChannel); }
	catch { return null; }

	const logChannel = await client.channels.fetch(guildConfig.logChannel) as TextChannel;
	return logChannel;
};
