import { Interaction } from 'discord.js';
import { handleInteraction } from '../lib/interaction-handler.js';

export const interactionCreate = (interaction: Interaction): void => {
	handleInteraction(interaction);
};
