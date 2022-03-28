import { ButtonInteraction, Interaction } from 'discord.js';
import { BotInteractionInfo } from '..';
import { handleInteraction } from '../lib/interaction-handler.js';
import { updateRole } from '../lib/interactions/update-role.js';

export const interactionCreate = async (interaction: Interaction) => {
	if (interaction.isButton) {
		const buttonInteraction = interaction as ButtonInteraction;

		// DEV
		if (buttonInteraction.customId.slice(0, buttonInteraction.customId.search(':')) === 'role') {
			await buttonInteraction.deferReply({ ephemeral: true });

			const roleId = buttonInteraction.customId.slice(buttonInteraction.customId.search(/\d/));
			const role = await interaction.guild.roles.fetch(roleId);

			updateRole(buttonInteraction, role);
			return;
		}

		const interactionInfo = JSON.parse(buttonInteraction.customId) as BotInteractionInfo;

		handleInteraction(buttonInteraction, interactionInfo.type);
	}
};
