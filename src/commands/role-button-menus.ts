import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, inlineCode, TextChannel } from 'discord.js';
import { BotCommand } from '..';
import { COLORS } from '../config/constants.js';
import { fetchDiscordChannel } from '../lib/misc/fetch-discord-channel.js';
import { generateId } from '../lib/misc/generate-id.js';
import { sendError } from '../lib/misc/send-error.js';
import { config } from '../private/config.js';

export const rolebuttonmenus = async (args: BotCommand): Promise<void> => {
	const { commandArgs, message } = args;
	const { guild } = message;

	const channelIDText = commandArgs.shift() ?? 'undefined';
	const channelID = channelIDText.replace(/\D/g, '');
	const channelToSendMenu = await fetchDiscordChannel(message.guild, channelID) as TextChannel;

	if (channelToSendMenu === null) {
		sendError(message, `${inlineCode(channelIDText)} is not a valid Channel!`);
		return;
	}

	const rolesMenuInfo = new EmbedBuilder()
		.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
		.setTitle('Get Roles')
		.setDescription('Click any of the buttons below to add or remove roles!\
		\n\nClicking on a button **without** having that role will give it to you.\
		\nClicking on a button **while** having that role will remove it from you.')
		.setColor(COLORS.COMMAND);

	const pronounMenu = new EmbedBuilder()
		.setImage('https://cdn.discordapp.com/attachments/868149626321141780/942885475205668894/Pronouns.png') // PLACEHOLDER IMAGE
		.setColor(COLORS.COMMAND);
	const pronounMenuButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles['He/Him'], ID: generateId(5) }))
			.setLabel('He/Him')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles['They/Them'], ID: generateId(5) }))
			.setLabel('They/Them')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles['She/Her'], ID: generateId(5) }))
			.setLabel('She/Her')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles['Any/All'], ID: generateId(5) }))
			.setLabel('Any/All')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles['Other Pronouns (Ask Me)'], ID: generateId(5) }))
			.setLabel('Other (Ask Me)')
			.setStyle(ButtonStyle.Primary)
	);

	const otherMenu = new EmbedBuilder()
		.setImage('https://cdn.discordapp.com/attachments/868149626321141780/945251321794134046/Miscellaenous.png') // PLACEHOLDER IMAGE
		.setColor(COLORS.COMMAND);
	const otherMenuButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles.Minecrafter, ID: generateId(5) }))
			.setLabel('Minecrafter')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles.Crafter, ID: generateId(5) }))
			.setLabel('Crafter')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles.Artist, ID: generateId(5) }))
			.setLabel('Artist')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles.Writer, ID: generateId(5) }))
			.setLabel('Writer')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles.Musician, ID: generateId(5) }))
			.setLabel('Musician')
			.setStyle(ButtonStyle.Secondary)
	);
	const otherMenuButtons2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles.Streamies, ID: generateId(5) }))
			.setLabel('Streamies')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'role', roleID: config.roles['Server Events'], ID: generateId(5) }))
			.setLabel('Server Events')
			.setStyle(ButtonStyle.Secondary)
	);

	await channelToSendMenu.send({ embeds: [rolesMenuInfo] });
	await channelToSendMenu.send({ embeds: [pronounMenu], components: [pronounMenuButtons] });
	channelToSendMenu.send({ embeds: [otherMenu], components: [otherMenuButtons, otherMenuButtons2] });
};
