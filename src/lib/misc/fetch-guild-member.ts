import { Guild, GuildMember } from 'discord.js';

export const fetchGuildMember = async (guild: Guild, userID: string): Promise<GuildMember> => {
	if (userID.length === 0) {
		return null;
	}

	try {
		const member = await guild.members.fetch(userID);
		return member;
	}
	catch {
		return null;
	}
};
