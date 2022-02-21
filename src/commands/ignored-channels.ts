import { bold, channelMention, inlineCode } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
import { BotCommand } from '..';
import { COLORS } from '../config/constants';
import prisma from '../prisma/client';

class embedBase {
	constructor(message: Message) {
		const { author, member } = message;
		new MessageEmbed()
			.setAuthor({ name: message.author.tag, iconURL: member.avatarURL() === null ? author.avatarURL() : member.avatarURL() })
			.setTitle('Ignored Channels');
	}
}

const addIgnoredChannel = async (commandArgs: Array<string>, message: Message) => {
	commandArgs.shift();

	if (typeof commandArgs.at(0) === 'undefined') {
		const error = new MessageEmbed(new embedBase(message))
			.setDescription(':warning: Channel must be a non-empty string!')
			.setColor(COLORS.FAIL);

		await message.reply({ embeds: [error] });
		return;
	}

	const channelId = commandArgs.at(0).replace(/\D/g, '');

	try {
		await message.client.channels.fetch(channelId);
	} catch {
		const error = new MessageEmbed(new embedBase(message))
			.setDescription(`:warning: "${channelId}" is not a valid Channel ID!`)
			.setColor(COLORS.FAIL);

		await message.reply({ embeds: [error] });
		return;
	}

	let guildConfig = await prisma.guildConfig.upsert({
		where: { guildId: message.guildId },
		update: {},
		create: { guildId: message.guildId }
	});

	const ignoredChannels: Array<string> = JSON.parse(guildConfig.ignoredChannels);

	if (ignoredChannels.includes(channelId)) {
		const error = new MessageEmbed(new embedBase(message))
			.setDescription(`:warning: "${channelMention(channelId)}" is already present within the Ignored Channels list for this guild!`)
			.setColor(COLORS.FAIL);

		await message.reply({ embeds: [error] });
		return;
	}

	ignoredChannels.push(channelId);

	guildConfig = await prisma.guildConfig.update({
		where: { guildId: message.guildId },
		data: { ignoredChannels: JSON.stringify(ignoredChannels) }
	});

	let desc = `Successfully added ${channelMention(channelId)} to Ignored Channels for this guild!\
	\n\n${bold('Currently Ignored Channels')}`;

	ignoredChannels.forEach((channel) => desc = desc.concat(`\n• ${channelMention(channel)}`));

	const success = new MessageEmbed(new embedBase(message))
		.setDescription(desc)
		.setColor(COLORS.SUCCESS);

	await message.reply({ embeds: [success] });
};

const removeIgnoredChannel = async (commandArgs: Array<string>, message: Message) => {
	commandArgs.shift();

	if (typeof commandArgs === 'undefined') {
		const error = new MessageEmbed(new embedBase(message))
			.setDescription(':warning: Channel must be a non-empty string!')
			.setColor(COLORS.FAIL);

		await message.reply({ embeds: [error] });
		return;
	}

	const channelId = commandArgs.at(0).replace(/\D/g, '');

	try {
		await message.client.channels.fetch(channelId);
	} catch {
		const error = new MessageEmbed(new embedBase(message))
			.setDescription(`:warning: "${channelId}" is not a valid Channel ID!`)
			.setColor(COLORS.FAIL);

		await message.reply({ embeds: [error] });
		return;
	}

	let guildConfig = await prisma.guildConfig.upsert({
		where: { guildId: message.guildId },
		update: {},
		create: { guildId: message.guildId }
	});

	let ignoredChannels: Array<string> = JSON.parse(guildConfig.ignoredChannels);

	if (!ignoredChannels.includes(channelId)) {
		const error = new MessageEmbed(new embedBase(message))
			.setDescription(`:warning: "${channelMention(channelId)}" is not present within the Ignored Channels list for this guild!`)
			.setColor(COLORS.FAIL);

		await message.reply({ embeds: [error] });
		return;
	}

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

	const success = new MessageEmbed(new embedBase(message))
		.setDescription(desc)
		.setColor(COLORS.SUCCESS);

	await message.reply({ embeds: [success] });
};

const resetIgnoredChannels = async (message: Message) => {
	await prisma.guildConfig.upsert({
		where: { guildId: message.guildId },
		update: { ignoredChannels: '[]' },
		create: { guildId: message.guildId }
	});

	const success = new MessageEmbed(new embedBase(message))
		.setDescription('Successfully reset Ignored Channels for this guild!')
		.setColor(COLORS.SUCCESS);

	await message.reply({ embeds: [success] });
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
			const error = new MessageEmbed(new embedBase(message))
				.setDescription(`:warning: "${operation}" is not a valid operation!\
				\nValid Operations: ${inlineCode('add')}, ${inlineCode('remove')} or ${inlineCode('reset')}`)
				.setColor(COLORS.FAIL);

			await message.reply({ embeds: [error] });
	}
};
