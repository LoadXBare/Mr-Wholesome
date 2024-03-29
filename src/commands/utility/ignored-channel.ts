import { channelMention, EmbedBuilder, inlineCode, Message } from 'discord.js';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { fetchDiscordTextChannel } from '../../lib/misc/fetch-discord-text-channel.js';
import { fetchIgnoredChannels } from '../../lib/misc/fetch-ignored-channels.js';
import { sendError } from '../../lib/misc/send-error.js';

const addIgnoredChannel = async (message: Message, ignoredChannelIDText: string): Promise<void> => {
	const ignoredChannelID = ignoredChannelIDText.replace(/\D/g, '');
	const ignoredChannel = await fetchDiscordTextChannel(message.guild, ignoredChannelID);

	if (ignoredChannel === null) {
		sendError(message, `${inlineCode(ignoredChannelIDText)} is not a valid Text Channel!`);
		return;
	}

	const ignoredChannels = await fetchIgnoredChannels(message.guildId);

	if (ignoredChannels.includes(ignoredChannelID)) {
		sendError(message, `${channelMention(ignoredChannelID)} is already an Ignored Channel!`);
		return;
	}

	ignoredChannels.push(ignoredChannelID);

	await mongodb.guildConfig.updateOne(
		{ guildID: message.guildId },
		{ $set: { ignoredChannelIDs: ignoredChannels } },
		{ upsert: true }
	);

	const ignoredChannelAddedEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Ignored Channel')
		.setDescription(`Successfully added ${channelMention(ignoredChannel.id)} to Ignored Channels!`)
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [ignoredChannelAddedEmbed] });
};

const removeIgnoredChannel = async (message: Message, ignoredChannelIDText: string): Promise<void> => {
	const ignoredChannelID = ignoredChannelIDText.replace(/\D/g, '');
	const ignoredChannel = await fetchDiscordTextChannel(message.guild, ignoredChannelID);
	const ignoredChannels = await fetchIgnoredChannels(message.guildId);

	if (!ignoredChannels.includes(ignoredChannelID)) {
		sendError(message, `${ignoredChannel !== null ? channelMention(ignoredChannelID) : inlineCode(ignoredChannelIDText)} is not an Ignored Channel!`);
		return;
	}

	const index = ignoredChannels.indexOf(ignoredChannelID);
	ignoredChannels.splice(index, 1);

	await mongodb.guildConfig.updateOne(
		{ guildID: message.guildId },
		{ $set: { ignoredChannelIDs: ignoredChannels } },
		{ upsert: true }
	);

	const removedIgnoredChannelEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Remove Ignored Channel')
		.setDescription(`Successfully removed ${channelMention(ignoredChannelID)} from Ignored Channels!`)
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [removedIgnoredChannelEmbed] });
};

const resetIgnoredChannels = async (message: Message): Promise<void> => {
	await mongodb.guildConfig.updateOne(
		{ guildID: message.guildId },
		{ $set: { ignoredChannelIDs: [] } },
		{ upsert: true }
	);

	const resetIgnoredChannelsEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Reset Ignored Channels')
		.setDescription('Successfully reset and cleared Ignored Channels list!')
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [resetIgnoredChannelsEmbed] });
};

const ignoredChannelCommand = (args: BotCommand): void => {
	const { commandArgs, message } = args;
	const operation = (commandArgs.shift() ?? 'undefined').toLowerCase();

	if (operation === 'add') {
		const ignoredChannelIDText = commandArgs.shift() ?? 'undefined';

		addIgnoredChannel(message, ignoredChannelIDText);
	}
	else if (operation === 'remove') {
		const ignoredChannelIDText = commandArgs.shift() ?? 'undefined';

		removeIgnoredChannel(message, ignoredChannelIDText);
	}
	else if (operation === 'reset') {
		resetIgnoredChannels(message);
	}
	else {
		sendError(message, `${inlineCode(operation)} is not a valid operation!\
		\n*For help, run ${inlineCode(`${BOT_PREFIX}help ignoredchannel`)}*`);
	}
};

export const ignoredChannel: Command = {
	devOnly: false,
	modOnly: true,
	run: ignoredChannelCommand,
	type: 'Utility'
};
