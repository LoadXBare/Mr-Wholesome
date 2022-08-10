import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, TextChannel, userMention } from 'discord.js';
import { mongodb } from '../api/mongo.js';
import { COLORS } from '../config/constants.js';
import { fetchGuildMember } from '../lib/misc/fetch-guild-member.js';

export const closeTicket = async (interaction: ButtonInteraction): Promise<void> => {
	const data = JSON.parse(interaction.customId);
	const ticketInfo = await mongodb.guildTicket.findById(data.ticketID);

	if (!ticketInfo.ticketOpen) {
		interaction.reply({ content: 'This ticket is already closed!', ephemeral: true });
		return;
	}

	await interaction.deferReply();

	const ticketChannel = interaction.channel as TextChannel;
	const ticketCreator = await fetchGuildMember(interaction.guild, ticketInfo.creatorID);

	await ticketChannel.permissionOverwrites.edit(ticketCreator.id, {
		ViewChannel: false
	});
	ticketChannel.setName(`✅${ticketCreator.displayName}`);
	await ticketInfo.updateOne({
		$set: { ticketOpen: false }
	});

	const ticketClosedEmbed = new EmbedBuilder()
		.setDescription(`Ticket closed by ${userMention(interaction.user.id)}`)
		.setColor(COLORS.NEUTRAL);
	const ticketControlButtons = new ActionRowBuilder<ButtonBuilder>().setComponents(
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'openTicket', ticketID: ticketInfo.id }))
			.setEmoji('🔓')
			.setLabel('Open')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'deleteTicket', ticketID: ticketInfo.id }))
			.setEmoji('🗑️')
			.setLabel('Delete')
			.setStyle(ButtonStyle.Secondary)
	);

	interaction.editReply({ embeds: [ticketClosedEmbed], components: [ticketControlButtons] });
};
