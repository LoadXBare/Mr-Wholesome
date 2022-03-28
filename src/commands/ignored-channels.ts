import { bold, channelMention } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
import { BotCommand } from '..';
import { COLORS } from '../config/constants.js';
import { handleError } from '../lib/error-handler.js';
import prisma from '../prisma/client.js';

class EmbedBase {
	constructor(message: Message) {
		const { author, member } = message;
		new MessageEmbed()
			.setAuthor({ name: message.author.tag, iconURL: member.avatarURL() === null ? author.avatarURL() : member.avatarURL() })
			.setTitle('Ignored Channels');
	}
}

const addIgnoredChannel = async (commandArgs: Array<string>, message: Message) => {
	commandArgs.shift();
	if (typeof commandArgs.at(0) === 'undefined')
		return handleError.missingArg({ message: message, missingArg: 'Channel ID' });

	const channelId = commandArgs.at(0).replace(/\D/g, '');

	try { await message.client.channels.fetch(channelId); }
	catch { return handleError.invalidArg({ invalidArg: 'Channel ID', message: message, passedArg: channelId }); }

	let guildConfig = await prisma.guildConfig.upsert({
		where: { guildId: message.guildId },
		update: {},
		create: { guildId: message.guildId }
	});

	const ignoredChannels: Array<string> = JSON.parse(guildConfig.ignoredChannels);

	if (ignoredChannels.includes(channelId))
		return handleError.databaseDuplicateEntry({ field: 'Ignored Channels', entry: channelId, message: message });

	ignoredChannels.push(channelId);

	guildConfig = await prisma.guildConfig.update({
		where: { guildId: message.guildId },
		data: { ignoredChannels: JSON.stringify(ignoredChannels) }
	});

	let desc = `Successfully added ${channelMention(channelId)} to Ignored Channels for this guild!\
	\n\n${bold('Currently Ignored Channels')}`;

	ignoredChannels.forEach((channel) => desc = desc.concat(`\n• ${channelMention(channel)}`));

	const success = new MessageEmbed(new EmbedBase(message))
		.setDescription(desc)
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [success] });
};

const removeIgnoredChannel = async (commandArgs: Array<string>, message: Message) => {
	commandArgs.shift();

	if (typeof commandArgs === 'undefined')
		return handleError.missingArg({ message: message, missingArg: 'Channel ID' });

	const channelId = commandArgs.at(0).replace(/\D/g, '');

	try { await message.client.channels.fetch(channelId); }
	catch { return handleError.invalidArg({ invalidArg: 'Channel ID', message: message, passedArg: channelId }); }

	let guildConfig = await prisma.guildConfig.upsert({
		where: { guildId: message.guildId },
		update: {},
		create: { guildId: message.guildId }
	});

	let ignoredChannels: Array<string> = JSON.parse(guildConfig.ignoredChannels);

	if (!ignoredChannels.includes(channelId))
		return handleError.databaseEntryNotFound({ entry: channelId, field: 'Ignored Channels', message: message });

	ignoredChannels = ignoredChannels.filter((value) => value !== channelId);

	guildConfig = await prisma.guildConfig.update({
		where: { guildId: message.guildId },
		data: { ignoredChannels: JSON.stringify(ignoredChannels) }
	});

	let desc = `Successfully removed "${channelMention(channelId)}" from Ignored Channels for this guild!\
	\n\n${bold('Currently Ignored Channels')}`;

	ignoredChannels.forEach((channel) => {
		desc = desc.concat(`\n• ${channelMention(channel)}`);
	});

	const success = new MessageEmbed(new EmbedBase(message))
		.setDescription(desc)
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [success] });
};

const resetIgnoredChannels = async (message: Message) => {
	await prisma.guildConfig.upsert({
		where: { guildId: message.guildId },
		update: { ignoredChannels: '[]' },
		create: { guildId: message.guildId }
	});

	const success = new MessageEmbed(new EmbedBase(message))
		.setDescription('Successfully reset Ignored Channels for this guild!')
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [success] });
};

export const ignoredchannels = async (args: BotCommand) => {
	const { commandArgs, message } = args;
	const operation = commandArgs.at(0).toLowerCase();

	switch (operation) {
		case 'add':
			addIgnoredChannel(commandArgs, message);
			break;
		case 'remove':
			removeIgnoredChannel(commandArgs, message);
			break;
		case 'reset':
			resetIgnoredChannels(message);
			break;
		default:
			return handleError.invalidArg({ invalidArg: 'Operation', message: message, passedArg: operation });
	}
};
