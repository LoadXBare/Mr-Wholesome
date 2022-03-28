import { formatEmoji, inlineCode, time } from '@discordjs/builders';
import { MessageEmbed, User } from 'discord.js';
import { BotCommand } from '..';
import { COLORS, COMMAND_INFO } from '../config/constants.js';
import { emojiUrl } from '../lib/misc/emoji-url.js';
import prisma from '../prisma/client.js';
import { emotes } from '../private/config.js';

const fetchGuildWarnings = async (guildId: string) => {
	//
};

const fetchMemberWarnings = async (memberId: string, guildId: string) => {
	//
};

export const warnings = async (args: BotCommand) => {
	const { commandArgs, message } = args;

	let userToLookup: string;
	let user: User;
	try {
		userToLookup = commandArgs.at(0).replace(/\D/g, '');
		user = await message.client.users.fetch(userToLookup);
	} catch {
		message.reply({ embeds: [COMMAND_INFO.WARNINGS] });
		return;
	}

	const userWarnings = await prisma.guildWarnings.findMany({
		where: {
			warneeId: user.id,
			guildId: message.guildId
		}
	});

	if (userWarnings.length === 0) {
		const warningsList = new MessageEmbed()
			.setDescription(`${formatEmoji(emotes.info)} There are no warnings for this user.`)
			.setColor(COLORS.FAIL);
		message.reply({ embeds: [warningsList] });
		return;
	}

	const warningsList = new MessageEmbed()
		.setAuthor({ name: 'Warnings', iconURL: emojiUrl(emotes.warning) })
		.setTitle(`Showing ${userWarnings.length} warning(s) for ${user.tag}`)
		.setColor(COLORS.NEUTRAL);

	for (const warning of userWarnings) {
		const warningIndex = userWarnings.indexOf(warning) + 1;
		const warningNumber = inlineCode(`#${warningIndex}`);
		const warnerUser = await message.client.users.fetch(warning.warnerId);

		warningsList.addField( // FIX: This will break if number of warnings exceeds 25
			`${warningNumber} ID: ${warning.warningId}`,
			`**Warned By:** ${warnerUser.tag}\
			\n**At:** ${time(warning.warningTimestamp)}\
			\n**Reason:** ${warning.reason}`
		);
	}

	message.reply({ embeds: [warningsList] });
};