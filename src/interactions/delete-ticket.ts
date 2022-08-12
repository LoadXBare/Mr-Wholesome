import { ButtonInteraction, EmbedBuilder, time } from 'discord.js';
import { mongodb } from '../api/mongo.js';
import { COLORS } from '../config/constants.js';
import { sleep } from '../lib/misc/sleep.js';

export const deleteTicket = async (interaction: ButtonInteraction): Promise<void> => {
	const deletionDelay = 5_000; // Milliseconds
	const closingTimestamp = Math.round((Date.now() + deletionDelay) / 1000);
	const data = JSON.parse(interaction.customId);

	const deletingTicketEmbed = new EmbedBuilder()
		.setDescription(`Ticket will be deleted **${time(closingTimestamp, 'R')}**!`)
		.setColor(COLORS.NEGATIVE);

	await interaction.reply({ embeds: [deletingTicketEmbed] });
	await mongodb.guildTicket.findByIdAndDelete(data.ticketID);
	await sleep(deletionDelay);
	interaction.channel.delete();
};
