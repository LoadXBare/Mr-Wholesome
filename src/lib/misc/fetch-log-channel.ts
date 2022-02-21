import { Client, TextChannel } from 'discord.js';
import prisma from '../../prisma/client.js';

export const fetchLogChannel = async (guildId: string, client: Client) => {
	const guildConfig = await prisma.guildConfig.upsert({
		where: { guildId: guildId },
		update: {},
		create: { guildId: guildId }
	});

	try {
		await client.channels.fetch(guildConfig.logChannel);
	} catch {
		return null;
	}

	const logChannel = await client.channels.fetch(guildConfig.logChannel) as TextChannel;
	return logChannel;
};