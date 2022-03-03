import { bold, roleMention } from '@discordjs/builders';
import { ButtonInteraction, GuildMemberRoleManager, Role } from 'discord.js';

export const updateRole = async (interaction: ButtonInteraction, role: Role) => {
	const memberRoles = interaction.member.roles as GuildMemberRoleManager;
	const reason = 'Role Menu';

	if (memberRoles.cache.has(role.id)) {
		await memberRoles.remove(role, reason);
		interaction.editReply(`Successfully ${bold('removed')} role: ${roleMention(role.id)}!`);
	} else {
		await memberRoles.add(role, reason);
		interaction.editReply(`Successfully ${bold('applied')} role: ${roleMention(role.id)}!`);
	}
};
