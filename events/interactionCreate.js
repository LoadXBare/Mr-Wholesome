const roleInteractionHandler = async (interaction) => {
	const memberRoles = interaction.member.roles.cache;
	const role = await interaction.guild.roles.fetch(interaction.values[0]);

	if (memberRoles.has(role.id)) interaction.member.roles.remove(role.id, 'Role Select Menu');
	else interaction.member.roles.add(role.id, 'Role Select Menu');

	await interaction.editReply({ content: `Successfully ${memberRoles.has(role.id) ? 'removed' : 'applied'} role ${role}!`, ephemeral: true });
};

module.exports = async (args) => {
	const interaction = args[0];
	await interaction.deferReply({ ephemeral: true });

	if (interaction.customId.startsWith('role')) await roleInteractionHandler(interaction);
};