import { ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonInteraction, EmbedBuilder } from 'discord.js';
import { mongodb } from '../api/mongo.js';
import { COLORS } from '../config/constants.js';

export const levelUpNotifications = async (interaction: ButtonInteraction): Promise<void> => {
	await interaction.deferReply({ ephemeral: true });

	const data = JSON.parse(interaction.customId);
	const userID = data.userID;
	const notifsEnabled = data.enabled;
	const messageButton = interaction.message.components.at(0).components.at(0) as ButtonComponent;

	if (interaction.user.id !== userID) {
		interaction.editReply('This button is not for you!');
		return;
	}

	const newMessageButton = new ActionRowBuilder<ButtonBuilder>().setComponents(
		new ButtonBuilder()
			.setCustomId(messageButton.customId)
			.setDisabled(true)
			.setEmoji(messageButton.emoji)
			.setLabel(messageButton.label)
			.setStyle(messageButton.style)
	);

	await mongodb.guildRanking.updateOne({
		guildID: interaction.guildId,
		memberID: userID
	}, {
		levelUpNotifications: notifsEnabled
	});

	await interaction.message.edit({ components: [newMessageButton] });

	const levelUpNotifsChanged = new EmbedBuilder()
		.setDescription(`Successfully ${notifsEnabled ? '**enabled**' : '**disabled**'} level up pings!`)
		.setFooter({ text: 'You will be given the option to change this again when you next level up.' })
		.setColor(COLORS.SUCCESS);
	interaction.editReply({ embeds: [levelUpNotifsChanged] });
};
