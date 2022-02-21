import { ButtonInteraction, Interaction } from 'discord.js';
import { BotInteraction } from '..';
import { handleInteraction } from '../lib/interaction-handler.js';

export const interactionCreate = async (interaction: Interaction) => {
	if (interaction.isButton) {
		const buttonInteraction = interaction as ButtonInteraction;
		const interactionType = buttonInteraction.customId.slice(0, buttonInteraction.customId.search(':')) as BotInteraction;

		handleInteraction(buttonInteraction, interactionType);
	}
};