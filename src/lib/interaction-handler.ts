import { ButtonInteraction, Interaction } from 'discord.js';
import interactions from '../lib/interactions/index.js';

export const handleInteraction = async (interaction: Interaction): Promise<void> => {
	// Currently unused
};

export const handleButtonInteraction = async (interaction: ButtonInteraction): Promise<void> => {
	const data = JSON.parse(interaction.customId);
	const type = data.type;

	if (type === 'ignore') {
		return;
	}
	else if (type === 'role') {
		await interaction.deferReply({ ephemeral: true });

		const roleID = data.roleID;
		const role = await interaction.guild.roles.fetch(roleID);

		interactions.updateRole(interaction, role);
	}
};
