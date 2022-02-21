import { bold, roleMention } from '@discordjs/builders';
import { ButtonInteraction, GuildMemberRoleManager, Role } from 'discord.js';

export const updateRole = async (interaction: ButtonInteraction, role: Role) => {
	const memberRoles = interaction.member.roles as GuildMemberRoleManager;
	const reason = '#get-roles';

	if (memberRoles.cache.has(role.id)) {
		await interaction.editReply(`Successfully ${bold('removed')} role: ${roleMention(role.id)}!`);
		await memberRoles.remove(role, reason);
	} else {
		await interaction.editReply(`Successfully ${bold('applied')} role: ${roleMention(role.id)}!`);
		await memberRoles.add(role, reason);
	}
};