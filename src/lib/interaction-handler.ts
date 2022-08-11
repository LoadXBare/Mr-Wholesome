import { ButtonInteraction, Interaction } from 'discord.js';
import { ButtonInteract } from '../index.js';
import interactions from '../interactions/index.js';

export const handleInteraction = async (interaction: Interaction): Promise<void> => {
	// Currently unused
};

export const handleButtonInteraction = async (interaction: ButtonInteraction): Promise<void> => {
	const data: ButtonInteract = JSON.parse(interaction.customId);
	const type = data.type;

	if (type === 'ignore') {
		return;
	}

	try {
		interactions[type](interaction);
	}
	catch {
		// interaction type does not exist
	}
};
