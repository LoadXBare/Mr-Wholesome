import { ButtonInteraction, Interaction } from 'discord.js';
import { handleButtonInteraction, handleInteraction } from '../lib/interaction-handler.js';

export const interactionCreate = async (interaction: Interaction): Promise<void> => {
	if (interaction.isButton) {
		handleButtonInteraction(interaction as ButtonInteraction);
	}
	else {
		handleInteraction(interaction);
	}
};
