import { ButtonInteraction, GuildMemberRoleManager, roleMention } from 'discord.js';

export const updateRole = async (interaction: ButtonInteraction): Promise<void> => {
	await interaction.deferReply({ ephemeral: true });

	const memberRoles = interaction.member.roles as GuildMemberRoleManager;
	const reason = 'Role Menu';
	const data = JSON.parse(interaction.customId);
	const role = await interaction.guild.roles.fetch(data.roleID);

	if (memberRoles.cache.has(role.id)) {
		await memberRoles.remove(role, reason);
		interaction.editReply(`Successfully **removed** role: ${roleMention(role.id)}!`);
	} else {
		await memberRoles.add(role, reason);
		interaction.editReply(`Successfully **applied** role: ${roleMention(role.id)}!`);
	}
};
