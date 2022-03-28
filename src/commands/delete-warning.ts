import { inlineCode, time } from '@discordjs/builders';
import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { BotCommand, ButtonChoice } from '..';
import { COLORS, COMMAND_INFO } from '../config/constants.js';
import prisma from '../prisma/client.js';

export const delwarn = async (args: BotCommand) => {
	const { commandArgs, message } = args;

	if (typeof commandArgs.at(0) === 'undefined' || typeof commandArgs.at(1) === 'undefined') {
		message.reply({ embeds: [COMMAND_INFO.DELETE_WARNING] });
		return;
	}
	const warneeId = commandArgs.at(0).replace(/\D/g, '');

	try {
		await message.client.users.fetch(warneeId);
	} catch {
		message.reply({ embeds: [COMMAND_INFO.DELETE_WARNING] });
		return;
	}

	const warningId = commandArgs.at(1);
	const warning = await prisma.guildWarnings.findUnique({
		where: {
			warningId: warningId
		}
	});

	if (!warning || warning.warneeId !== warneeId) {
		message.reply({ embeds: [COMMAND_INFO.DELETE_WARNING] });
		return;
	}

	const warner = await message.client.users.fetch(warning.warnerId);

	const deleteWarning = new MessageEmbed()
		.setAuthor({
			name: 'Delete Warning'
		})
		.setDescription('Are you sure you want to delete this warning?')
		.setFields([
			{
				name: `ID: ${warning.warningId}`,
				value: `**Warned By:** ${warner.tag}\
				\n**At:** ${time(warning.warningTimestamp)}\
				\n**Reason:** ${inlineCode(warning.reason)}`
			}
		])
		.setColor(COLORS.COMMAND);

	const deleteButtons = new MessageActionRow().setComponents(
		new MessageButton()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'Yes' }))
			.setLabel('Yes')
			.setStyle('SUCCESS'),
		new MessageButton()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'No' }))
			.setLabel('Cancel')
			.setStyle('DANGER')
	);

	const commandReply = await message.reply({ embeds: [deleteWarning], components: [deleteButtons] });

	const filter = (i: ButtonInteraction) => i.user.id === message.author.id;
	const buttonChoice = await message.channel.awaitMessageComponent({ componentType: 'BUTTON', filter, idle: 10000 }).catch(() => {
		const timeout = new MessageEmbed(deleteWarning)
			.setFooter({ text: 'Warning deletion timedout.' })
			.setColor(COLORS.TIMEOUT);
		commandReply.edit({ embeds: [timeout], components: [] });
		return;
	});

	if (typeof buttonChoice === 'undefined')
		return;

	const choice = JSON.parse(buttonChoice.customId) as ButtonChoice;

	if (choice.value === 'Yes') {
		await prisma.guildWarnings.delete({
			where: {
				warningId: warning.warningId
			}
		});

		const warningDeleted = new MessageEmbed(deleteWarning)
			.setDescription('Warning deleted!')
			.setFields([])
			.setColor(COLORS.SUCCESS);

		commandReply.edit({ embeds: [warningDeleted], components: [] });
	} else {
		const warningDeleteCancelled = new MessageEmbed(deleteWarning)
			.setFooter({ text: 'Warning deletion cancelled.' })
			.setColor(COLORS.NEGATIVE);

		commandReply.edit({ embeds: [warningDeleteCancelled], components: [] });
	}
};
