import { ButtonInteraction, Interaction } from 'discord.js';
import { BotInteraction } from '..';
import * as interactions from './interactions/index.js';

export const handleInteraction = async (interaction: Interaction | ButtonInteraction, type: BotInteraction) => {
	if (type === 'ignore') return;

	if (type === 'role') {
		const i = interaction as ButtonInteraction;
		await i.deferReply({ ephemeral: true });

		const roleId = i.customId.slice(i.customId.search(/\d/));
		const role = await interaction.guild.roles.fetch(roleId);

		interactions.updateRole(i, role);
	}
};