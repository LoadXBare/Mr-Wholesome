import { ActionRowBuilder, ButtonBuilder, ButtonStyle, channelMention, codeBlock, Collection, EmbedBuilder, inlineCode, Message, TextChannel, time } from 'discord.js';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { BotCommand } from '../../index.js';
import { sendError } from '../../lib/misc/send-error.js';

const embedPrompt = async (message: Message, commandReply: Message, prompt: string): Promise<string> => {
	const awaitTime = 30_000; // Milliseconds

	const promptEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Ticket Panel')
		.setDescription(`Paste the JSON used for the **${prompt}**!\
		\n\n*This will timeout ${time(Math.round((Date.now() + awaitTime) / 1000), 'R')}!*`)
		.setFooter({ text: 'You can use https://glitchii.github.io/embedbuilder/ for embed JSON!' })
		.setColor(COLORS.COMMAND);

	commandReply.edit({ content: null, embeds: [promptEmbed] });

	const filter = (msg: Message): boolean => {
		return msg.author.id === message.author.id;
	};

	const collectedMessages = await message.channel.awaitMessages({ filter: filter, max: 1, time: awaitTime }).catch(() => { }) as Collection<string, Message<boolean>>;

	if (collectedMessages.size === 0) {
		sendError(message, `No messages sent within ${awaitTime / 1000} seconds, panel creation cancelled.`);
		return null;
	}

	const embedString = collectedMessages.at(0).content;

	try {
		JSON.parse(embedString);
	}
	catch (e) {
		sendError(message, `Invalid JSON, panel creation cancelled!\n\n${codeBlock(e)}`);
		return null;
	}

	const panelEmbed = JSON.parse(embedString);

	try {
		const tempMsg = await message.channel.send({ embeds: [panelEmbed] });
		await tempMsg.delete();
	}
	catch (e) {
		sendError(message, `Invalid embed JSON, panel creation cancelled!\n\n${codeBlock(e)}`);
		return null;
	}
	finally {
		await collectedMessages.at(0).delete();
	}

	return JSON.stringify(panelEmbed);
};

const channelPrompt = async (message: Message, commandReply: Message, prompt: string): Promise<string> => {
	const awaitTime = 30_000; // Milliseconds

	const promptEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Ticket Panel')
		.setDescription(`Please enter the **${prompt}**!\
		\n\n*This will timeout ${time(Math.round((Date.now() + awaitTime) / 1000), 'R')}!*`)
		.setColor(COLORS.COMMAND);

	commandReply.edit({ content: null, embeds: [promptEmbed] });

	const filter = (msg: Message): boolean => {
		return msg.author.id === message.author.id;
	};

	const collectedMessages = await message.channel.awaitMessages({ filter: filter, max: 1, time: awaitTime }).catch(() => { }) as Collection<string, Message<boolean>>;

	if (collectedMessages.size === 0) {
		sendError(message, `No messages sent within ${awaitTime / 1000} seconds, panel creation cancelled.`);
		return null;
	}

	const channelIDString = collectedMessages.at(0).content;

	try {
		await message.guild.channels.fetch(channelIDString);
	}
	catch {
		sendError(message, `${inlineCode(channelIDString)} is not a valid Channel ID!`);
		return null;
	}
	finally {
		await collectedMessages.at(0).delete();
	}

	return channelIDString;
};

const textPrompt = async (message: Message, commandReply: Message, prompt: string): Promise<string> => {
	const awaitTime = 30_000; // Milliseconds

	const promptEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Ticket Panel')
		.setDescription(`Please enter the **${prompt}**!\
		\n\n*This will timeout ${time(Math.round((Date.now() + awaitTime) / 1000), 'R')}!*`)
		.setColor(COLORS.COMMAND);

	commandReply.edit({ content: null, embeds: [promptEmbed] });

	const filter = (msg: Message): boolean => {
		return msg.author.id === message.author.id;
	};

	const collectedMessages = await message.channel.awaitMessages({ filter: filter, max: 1, time: awaitTime }).catch(() => { }) as Collection<string, Message<boolean>>;

	if (collectedMessages.size === 0) {
		sendError(message, `No messages sent within ${awaitTime / 1000} seconds, panel creation cancelled.`);
		return null;
	}

	let text = collectedMessages.at(0).content;
	if (text.length === 0) {
		text = 'No text provided.';
	}
	await collectedMessages.at(0).delete();

	return text;
};

const createPanel = async (message: Message): Promise<void> => {
	const commandReply = await message.reply('Please wait...');

	const panelEmbedString = await embedPrompt(message, commandReply, 'Panel Embed');
	if (panelEmbedString === null) {
		return;
	}

	const ticketEmbedString = await embedPrompt(message, commandReply, 'Ticket Embed');
	if (ticketEmbedString === null) {
		return;
	}

	const ticketCategoryID = await channelPrompt(message, commandReply, 'Ticket Category ID');
	if (ticketCategoryID === null) {
		return;
	}

	const panelName = await textPrompt(message, commandReply, 'Panel Name');
	if (panelName === null) {
		return;
	}

	const panelDatabaseEntry = await mongodb.guildTicketPanel.create({
		guildID: message.guildId,
		panelEmbedJSON: panelEmbedString,
		ticketCategoryID: ticketCategoryID,
		ticketEmbedJSON: ticketEmbedString,
		panelName: panelName
	});

	const panelCreatedEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Ticket Panel')
		.setDescription(`Successfully created Ticket Panel: **${panelName}**!`)
		.setFooter({ text: `Panel ID: ${panelDatabaseEntry.id}` })
		.setColor(COLORS.SUCCESS);

	commandReply.edit({ embeds: [panelCreatedEmbed] });
};

const deletePanel = async (message: Message, panelName: string): Promise<void> => {
	const panelDeletedEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Ticket Panel')
		.setDescription(`Successfully deleted Ticket Panel **${panelName}**!`)
		.setFooter({ text: 'Any tickets created using this panel will continue to function.' })
		.setColor(COLORS.SUCCESS);

	const panel = await mongodb.guildTicketPanel.findOne({
		panelName: panelName
	});

	if (panel !== null) {
		panel.delete();
		message.reply({ embeds: [panelDeletedEmbed] });
		return;
	}

	sendError(message, `The panel ${inlineCode(panelName)} is either invalid or doesn't exist!`);
};

const postPanel = async (message: Message, panelName: string, channelID: string): Promise<void> => {
	let panelChannel: TextChannel;
	try {
		panelChannel = await message.guild.channels.fetch(channelID) as TextChannel;
	}
	catch {
		sendError(message, `${inlineCode(channelID)} is not a valid Channel!`);
		return;
	}

	const panel = await mongodb.guildTicketPanel.findOne({
		panelName: panelName
	});
	if (panel === null) {
		sendError(message, `The panel ${inlineCode(panelName)} does not exist!`);
		return;
	}

	const panelEmbed = JSON.parse(panel.panelEmbedJSON);
	const panelButtons = new ActionRowBuilder<ButtonBuilder>().setComponents(
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'createTicket', panelName: panelName }))
			.setLabel('Create Ticket')
			.setStyle(ButtonStyle.Primary)
	);

	try {
		await panelChannel.send({ embeds: [panelEmbed], components: [panelButtons] });
	}
	catch (e) {
		sendError(message, `An error occurred whilst attempting to post the panel in ${channelMention(channelID)}!\
		\n${codeBlock(e)}`);
		return;
	}

	const panelPostedEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Ticket Panel')
		.setDescription(`Successfully posted Ticket Panel **${panelName}** in ${channelMention(channelID)}!`)
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [panelPostedEmbed] });
};

const listPanels = async (message: Message): Promise<void> => {
	const panels = await mongodb.guildTicketPanel.find({
		guildID: message.guildId
	});

	let panelsList = '';
	if (panels.length === 0) {
		panelsList = 'There are no Ticket Panels within this guild!';
	}

	for (const panel of panels) {
		panelsList = panelsList.concat(`\n• **${panel.panelName}**`);
	}

	const panelsListEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle(`Displaying all Ticket Panels within ${message.guild.name}`)
		.setDescription(panelsList)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [panelsListEmbed] });
};

export const ticketPanel = async (args: BotCommand): Promise<void> => {
	const { commandArgs, message } = args;
	const operation = commandArgs.shift();

	if (operation === 'create') {
		createPanel(message);
	}
	else if (operation === 'delete') {
		const panelName = commandArgs.join(' ');
		deletePanel(message, panelName);
	}
	else if (operation === 'post') {
		const channelID = commandArgs.shift().replace(/\D/g, '') ?? 'undefined';
		const panelName = commandArgs.join(' ');
		postPanel(message, panelName, channelID);
	}
	else if (operation === 'list') {
		listPanels(message);
	}
	else {
		sendError(message, `${inlineCode(operation)} is not a valid operation!\
		\n*For help, run ${inlineCode(`${BOT_PREFIX}help ticketpanel`)}*`);
	}
};
