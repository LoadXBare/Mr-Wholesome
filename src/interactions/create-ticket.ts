import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, channelMention, ChannelType, PermissionFlagsBits, userMention } from 'discord.js';
import { mongodb } from '../api/mongo.js';
import { fetchGuildMember } from '../lib/misc/fetch-guild-member.js';
import { config } from '../private/config.js';

type Variables = {
	[variable: string]: string
}

export const createTicket = async (interaction: ButtonInteraction): Promise<void> => {
	await interaction.deferReply({ ephemeral: true });

	const data = JSON.parse(interaction.customId);
	const panel = await mongodb.guildTicketPanel.findOne({
		panelName: data.panelName
	});
	const creatorMember = await fetchGuildMember(interaction.guild, interaction.user.id);

	const ticketChannel = await interaction.guild.channels.create({
		name: `❌${creatorMember.displayName}`,
		parent: panel.ticketCategoryID,
		permissionOverwrites: [
			{
				id: config.roles.Mods,
				allow: [PermissionFlagsBits.ViewChannel]
			},
			{
				id: interaction.user.id,
				allow: [PermissionFlagsBits.ViewChannel]
			},
			{
				id: interaction.guild.roles.everyone,
				deny: [PermissionFlagsBits.ViewChannel]
			},
			{
				id: interaction.client.user.id,
				allow: [PermissionFlagsBits.ViewChannel]
			}
		],
		type: ChannelType.GuildText
	});

	const variables: Variables = {
		'{author}': userMention(interaction.user.id),
		'{author.name}': interaction.user.username,
		'{author.id}': interaction.user.id,
		'{author.nickname}': creatorMember.displayName,
		'{author.icon}': creatorMember.displayAvatarURL(),
		'{author.full}': interaction.user.tag,
		'{ticket}': channelMention(ticketChannel.id),
		'{ticket.id}': ticketChannel.id,
		'{ticket.name}': ticketChannel.name
	};

	let ticketEmbedData = panel.ticketEmbedJSON;
	for (const variable in variables) {
		const regex = new RegExp(`${variable}`, 'g');
		ticketEmbedData = ticketEmbedData.replace(regex, variables[variable]);
	}

	const databaseEntry = await mongodb.guildTicket.create({
		creatorID: interaction.user.id,
		ticketOpen: true
	});

	const ticketEmbed = JSON.parse(ticketEmbedData);
	const ticketButtons = new ActionRowBuilder<ButtonBuilder>().setComponents(
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'closeTicket', ticketID: databaseEntry.id }))
			.setEmoji('🔒')
			.setLabel('Close')
			.setStyle(ButtonStyle.Secondary)
	);
	await ticketChannel.send({ embeds: [ticketEmbed], components: [ticketButtons] });

	interaction.editReply({ content: `Ticket Created: ${channelMention(ticketChannel.id)}!` });
};
