import { channelMention } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
import { BotCommand } from '..';
import { COLORS } from '../config/constants';
import { handleError } from '../lib/error-handler';
import prisma from '../prisma/client';

class embedBase {
	constructor(message: Message) {
		const { author, member } = message;
		return new MessageEmbed()
			.setAuthor({ name: author.tag, iconURL: member.avatarURL() === null ? author.avatarURL() : member.avatarURL() })
			.setTitle('Log Channel');
	}
}

export const setlogchannel = async (args: BotCommand) => {
	const { commandArgs, message } = args;
	if (typeof commandArgs.at(0) === 'undefined') return handleError.missingArg({ message: message, missingArg: 'Channel ID' });

	const channelId = commandArgs.at(0).replace(/\D/g, '');

	try { await message.client.channels.fetch(channelId); }
	catch { return handleError.invalidArg({ invalidArg: 'Channel ID', message: message, passedArg: channelId }); }

	const guildConfig = await prisma.guildConfig.upsert({
		where: { guildId: message.guildId },
		update: { logChannel: channelId },
		create: { guildId: message.guildId }
	});

	const success = new MessageEmbed(new embedBase(message))
		.setDescription(`Successfully set the Log Channel for this guild to ${channelMention(guildConfig.logChannel)}!`)
		.setColor(COLORS.SUCCESS);

	await message.reply({ embeds: [success] });
};
