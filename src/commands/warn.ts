import { bold, userMention } from '@discordjs/builders';
import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { BotCommand } from '..';
import { COLORS, COMMAND_INFO } from '../config/constants.js';
import { generateId } from '../lib/misc/generate-id.js';
import prisma from '../prisma/client.js';

export const warn = async (args: BotCommand) => {
	const { message, commandArgs } = args;

	if (typeof commandArgs.at(0) === 'undefined') {
		message.reply({ embeds: [COMMAND_INFO.WARN] });
		return;
	}

	const warneeId = commandArgs.at(0).replace(/\D/g, '');

	try {
		await message.client.users.fetch(warneeId);
	} catch {
		message.reply({ embeds: [COMMAND_INFO.WARN] });
		return;
	}

	commandArgs.shift();
	const warnee = await message.client.users.fetch(warneeId);
	const reason = commandArgs.join(' ').trim().length > 0
		? commandArgs.join(' ').trim()
		: 'No reason provided';

	const warning = new MessageEmbed()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Warning')
		.setDescription(`You're about to warn this user, is everything correct?
		
		${bold('Warning:')} ${userMention(warnee.id)}
		${bold('For:')} ${reason}`)
		.setColor(COLORS.COMMAND);

	const confirm = new MessageActionRow().setComponents(
		new MessageButton()
			.setCustomId('ignore: Yes')
			.setLabel('Yes')
			.setStyle('SUCCESS'),
		new MessageButton()
			.setCustomId('ignore: No')
			.setLabel('No')
			.setStyle('DANGER'),
		new MessageButton()
			.setCustomId('ignore: NoDM')
			.setLabel('Yes (Don\'t DM)')
			.setStyle('SECONDARY')
	);

	const commandReply = await message.reply({ embeds: [warning], components: [confirm] });
	const filter = (i: ButtonInteraction) => i.user.id === message.author.id;
	const buttonChoice = await message.channel.awaitMessageComponent({ componentType: 'BUTTON', idle: 30000, filter }).catch(() => {
		const warningTimeout = new MessageEmbed(warning)
			.setFooter({ text: 'Warning timedout.' })
			.setColor(COLORS.TIMEOUT);
		commandReply.edit({ embeds: [warningTimeout], components: [] });
		return;
	});

	if (typeof buttonChoice === 'undefined')
		return;

	const choice = buttonChoice.customId.slice(buttonChoice.customId.search(':') + 2);
	if (choice === 'Yes' || choice === 'NoDM') {
		const warningId = generateId(8);
		await prisma.guildWarnings.create({
			data: {
				guildId: message.guildId,
				warneeId: warnee.id,
				warnerId: message.author.id,
				warningId: warningId,
				warningTimestamp: Math.round(Date.now() / 1000),
				reason: reason
			}
		});

		const warningSent = new MessageEmbed(warning)
			.setDescription('Warning added and DMed to member!')
			.setColor(COLORS.SUCCESS);

		if (choice !== 'NoDM') {
			const warningEmbed = new MessageEmbed()
				.setDescription(`You have been warned in ${bold(message.guild.name)}.`)
				.setFields({
					name: 'Reason',
					value: reason
				})
				.setColor(COLORS.NEGATIVE)
				.setTimestamp();

			try {
				await warnee.send({ embeds: [warningEmbed] });
			} catch {
				warningSent.setDescription('Warning added!\
				\n(However there was a problem DMing the member)');
				warningSent.setColor('YELLOW');
			}
		} else {
			warningSent.setDescription('Warning added!');
		}
		commandReply.edit({ embeds: [warningSent], components: [] });
	} else {
		const warningCancelled = new MessageEmbed(warning)
			.setFooter({ text: 'Warning cancelled.' })
			.setColor(COLORS.NEGATIVE);
		commandReply.edit({ embeds: [warningCancelled], components: [] });
	}
};
