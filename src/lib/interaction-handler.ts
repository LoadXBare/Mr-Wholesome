import { ButtonInteraction, Interaction } from 'discord.js';
import * as interactions from './interactions/index.js';

const handleButtonInteraction = async (interaction: ButtonInteraction, type: string) => {
	switch (type) {
		case 'role':
			await interaction.deferReply({ ephemeral: true });

			const roleId = interaction.customId.slice(interaction.customId.search(/\d/));
			const role = await interaction.guild.roles.fetch(roleId);

			interactions.updateRole(interaction, role);
			break;

		default:

			break;
	}
};

export const handleInteraction = async (interaction: Interaction | ButtonInteraction, type: string) => {
	if (type === 'ignore')
		return;

	if (interaction.isButton)
		handleButtonInteraction(interaction as ButtonInteraction, type);
};
