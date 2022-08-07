import { GuildMember } from 'discord.js';

export const isModerator = (member: GuildMember): boolean => {
	return member.permissions.has('KickMembers');
};
