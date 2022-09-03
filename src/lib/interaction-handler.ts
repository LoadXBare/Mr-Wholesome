import { ButtonInteraction, Interaction } from 'discord.js';
import { ButtonInteract } from '../index.js';
import { interactions } from '../interactions/index.js';

export const handleInteraction = (interaction: Interaction): void => {
	if (interaction.isButton) {
		const buttonInteraction = interaction as ButtonInteraction;
		const buttonData: ButtonInteract = JSON.parse(buttonInteraction.customId);

		if (buttonData.type in interactions) {
			interactions[buttonData.type](buttonInteraction);
		}
		else {
			return;
		}
	}
};
