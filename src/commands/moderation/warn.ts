import { inlineCode } from '@discordjs/builders';
import dayjs from 'dayjs';
import { ButtonInteraction, Message, MessageActionRow, MessageButton, MessageEmbed, User } from 'discord.js';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { BotCommand } from '../../index.js';
import { fetchDiscordUser } from '../../lib/misc/fetch-discord-user.js';
import { sendError } from '../../lib/misc/send-error.js';

type WarningCount = {
	[userID: string]: number
}

const addWarning = async (message: Message, warnedUser: User, warningReason: string): Promise<void> => {
	const creatorUserID = message.author.id;
	const warnedUserID = warnedUser.id;

	const warningEmbed = new MessageEmbed()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Warning')
		.setDescription(`You're about to warn ${inlineCode(warnedUser.tag)}, is everything correct?`)
		.setFields([
			{
				name: 'Reason',
				value: warningReason
			}
		])
		.setColor(COLORS.COMMAND);

	const confirmButtons = new MessageActionRow().setComponents(
		new MessageButton()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'YesDM' }))
			.setLabel('Yes')
			.setStyle('SUCCESS'),
		new MessageButton()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'No' }))
			.setLabel('No')
			.setStyle('DANGER'),
		new MessageButton()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'Yes' }))
			.setLabel('Yes (Don\'t DM)')
			.setStyle('SECONDARY')
	);

	const commandReply = await message.reply({ embeds: [warningEmbed], components: [confirmButtons] });

	const interactionFilter = (interaction: ButtonInteraction): boolean => {
		return interaction.user.id === creatorUserID;
	};

	const buttonChoice = await message.channel.awaitMessageComponent({ componentType: 'BUTTON', idle: 30_000, filter: interactionFilter }).catch(() => { });

	if (typeof buttonChoice === 'undefined') {
		const warningTimeoutEmbed = new MessageEmbed(warningEmbed)
			.setFooter({ text: 'Warning timed out.' })
			.setColor(COLORS.TIMEOUT);

		commandReply.edit({ embeds: [warningTimeoutEmbed], components: [] });
		return;
	}

	const choice = JSON.parse(buttonChoice.customId).value;

	if (choice === 'YesDM' || choice === 'Yes') {
		const warning = await mongodb.guildWarning.create({
			creatorUserID: creatorUserID,
			guildID: message.guildId,
			warnedUserID: warnedUserID,
			warningReason: warningReason,
			warningDate: dayjs().toISOString()
		});

		const warningSentEmbed = new MessageEmbed(warningEmbed)
			.setDescription('Warning added and successfully DMed to member!')
			.setFields()
			.setFooter({ text: `Warning ID: ${warning._id}` })
			.setColor(COLORS.SUCCESS);

		if (choice === 'YesDM') {
			const warningDMEmbed = new MessageEmbed()
				.setDescription(`You have been warned in **${message.guild.name}**.`)
				.setFields([
					{
						name: 'Reason',
						value: warningReason
					}
				])
				.setColor(COLORS.NEGATIVE)
				.setTimestamp();

			try {
				await warnedUser.send({ embeds: [warningDMEmbed] });
			}
			catch {
				warningSentEmbed
					.setDescription('Warning added!\
						\n(However there was a problem DMing the member)')
					.setColor('YELLOW');
			}
		}
		else {
			warningSentEmbed
				.setDescription('Warning added!');
		}

		commandReply.edit({ embeds: [warningSentEmbed], components: [] });
	}
	else {
		const warningCancelledEmbed = new MessageEmbed(warningEmbed)
			.setFooter({ text: 'Warning cancelled.' })
			.setColor(COLORS.NEGATIVE);

		commandReply.edit({ embeds: [warningCancelledEmbed], components: [] });
	}
};

const removeWarning = async (message: Message, warningID: string): Promise<void> => {
	const warning = await mongodb.guildWarning.findById(warningID).catch(() => { });

	if (typeof warning === 'undefined' || warning === null) {
		sendError(message, `${inlineCode(warningID)} is not a valid Warning ID!`);
		return;
	}

	const warningCreator = await message.client.users.fetch(warning.creatorUserID);

	const deleteWarningEmbed = new MessageEmbed()
		.setAuthor({
			name: 'Delete Warning',
			iconURL: message.member.displayAvatarURL()
		})
		.setDescription('Are you sure you want to delete this warning?')
		.setFields([
			{
				name: 'Warned By',
				value: warningCreator.tag
			},
			{
				name: 'Warned On',
				value: dayjs(warning.warningDate).format('MMMM DD, YYYY [at] hh:mma UTC')
			},
			{
				name: 'Reason',
				value: warning.warningReason
			}
		])
		.setColor(COLORS.COMMAND);

	const deleteWarningButtons = new MessageActionRow().setComponents(
		new MessageButton()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'Yes' }))
			.setLabel('Yes')
			.setStyle('SUCCESS'),
		new MessageButton()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'No' }))
			.setLabel('No')
			.setStyle('DANGER')
	);

	const commandReply = await message.reply({ embeds: [deleteWarningEmbed], components: [deleteWarningButtons] });

	const interactionFilter = (interaction: ButtonInteraction): boolean => {
		return interaction.user.id === message.author.id;
	};

	const buttonChoice = await message.channel.awaitMessageComponent({ filter: interactionFilter, componentType: 'BUTTON', idle: 10_000 }).catch(() => { });

	if (typeof buttonChoice === 'undefined') {
		const deleteWarningTimedoutEmbed = new MessageEmbed(deleteWarningEmbed)
			.setFooter({ text: 'Warning deletion timed out.' })
			.setColor(COLORS.TIMEOUT);
		commandReply.edit({ embeds: [deleteWarningTimedoutEmbed], components: [] });
		return;
	}

	const choice = JSON.parse(buttonChoice.customId).value;

	if (choice === 'Yes') {
		await mongodb.guildWarning.findByIdAndDelete(warningID);

		const warningDeletedEmbed = new MessageEmbed(deleteWarningEmbed)
			.setDescription('Warning successfully deleted!')
			.setFields()
			.setColor(COLORS.SUCCESS);

		commandReply.edit({ embeds: [warningDeletedEmbed], components: [] });
	}
	else {
		const deleteWarningCancelledEmbed = new MessageEmbed(deleteWarningEmbed)
			.setFooter({ text: 'Warning deletion cancelled.' })
			.setColor(COLORS.NEGATIVE);

		commandReply.edit({ embeds: [deleteWarningCancelledEmbed], components: [] });
	}
};

const viewWarnings = async (message: Message, data: string): Promise<void> => {
	const warnedUserID = data.replace(/\D/g, '');
	const warnedUser = await fetchDiscordUser(message.client, warnedUserID);
	const warningID = data;
	const warning = await mongodb.guildWarning.findById(warningID).catch(() => { });

	const displayGuildWarnings = async (): Promise<void> => {
		const warnings = await mongodb.guildWarning.find({
			guildID: message.guildId
		});

		let warningsList = '';
		const userWarningsCount: WarningCount = {};
		for (const warn of warnings) {
			const userCount = userWarningsCount[warn.warnedUserID];

			if (typeof userCount === 'undefined') {
				userWarningsCount[warn.warnedUserID] = 0;
			}

			userWarningsCount[warn.warnedUserID] += 1;
		}

		for (const warnedUserID in userWarningsCount) {
			const warnedUser = await fetchDiscordUser(message.client, warnedUserID);
			const warningCount = userWarningsCount[warnedUserID];

			warningsList = warningsList.concat(`**${warnedUser.tag}** - ${warningCount} warning(s)\n`);
		}

		const guildWarningsEmbed = new MessageEmbed()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.member.displayAvatarURL()
			})
			.setTitle(`Displaying all warnings within ${message.guild.name}`)
			.setDescription(warningsList)
			.setColor(COLORS.COMMAND);

		message.reply({ embeds: [guildWarningsEmbed] });
	};

	const displayUserWarnings = async (): Promise<void> => {
		const warnings = await mongodb.guildWarning.find({
			warnedUserID: warnedUser.id,
			guildID: message.guildId
		});

		let warningsList = '';
		if (warnings.length === 0) {
			warningsList = '**This user has no warnings!** 🎉';
		}
		else {
			for (const warn of warnings) {
				const index = warnings.indexOf(warn) + 1;

				warningsList = warningsList.concat(`**#${index}** - ${inlineCode(warn._id.toString())}\n`);
			}
		}

		const warningsListEmbed = new MessageEmbed()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.member.displayAvatarURL()
			})
			.setTitle(`Displaying all warnings for ${inlineCode(warnedUser.tag)}`)
			.setDescription(`If you would like more information on a specific warning run ${inlineCode(`${BOT_PREFIX}warn view [Warning ID]`)}, for example: ${inlineCode(`${BOT_PREFIX}warn view 62b5e1da6ae90a1613f9aaca`)}.\
			\n\n${warningsList}`)
			.setColor(COLORS.COMMAND);

		message.reply({ embeds: [warningsListEmbed] });
	};

	const displaySpecificWarning = async (): Promise<void> => {
		if (typeof warning === 'undefined') return; // This is required to satisfy TypeScript's engine, else it still thinks "warning" has type "void", will be removed if better alternative found
		const creatorUser = await message.client.users.fetch(warning.creatorUserID);

		const specificWarningEmbed = new MessageEmbed()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.member.displayAvatarURL()
			})
			.setTitle(`Displaying Warning: "${warningID}"`)
			.setFields([
				{
					name: 'Warned By',
					value: creatorUser.tag
				},
				{
					name: 'Warned On',
					value: dayjs(warning.warningDate).format('MMMM DD, YYYY [at] hh:mma UTC')
				},
				{
					name: 'Reason',
					value: warning.warningReason
				}
			])
			.setColor(COLORS.COMMAND);

		message.reply({ embeds: [specificWarningEmbed] });
	};

	if (data.length === 0) {
		displayGuildWarnings();
	}
	else if (warnedUser !== null) {
		displayUserWarnings();
	}
	else if (typeof warning !== 'undefined') {
		displaySpecificWarning();
	}
	else {
		sendError(message, `${inlineCode(data)} is not a valid User or Warning ID!`);
	}
};

export const warn = async (args: BotCommand): Promise<void> => {
	const { message, commandArgs } = args;
	const operation = (commandArgs.shift() ?? 'undefined').toLowerCase();
	const user = await fetchDiscordUser(message.client, operation.replace(/\D/g, ''));

	if (user !== null) {
		let warningReason = commandArgs.join(' ');
		if (warningReason.length === 0) {
			warningReason = 'No reason provided.';
		}

		addWarning(message, user, warningReason);
	}
	else if (operation === 'add') {
		const warnedUserID = commandArgs.shift() ?? 'undefined';
		const warnedUser = await fetchDiscordUser(message.client, warnedUserID.replace(/\D/g, ''));

		if (warnedUser === null) {
			sendError(message, `${inlineCode(warnedUserID)} is not a valid User!`);
			return;
		}

		let warningReason = commandArgs.join(' ');
		if (warningReason === '') {
			warningReason = 'No reason provided.';
		}

		addWarning(message, warnedUser, warningReason);
	}
	else if (operation === 'remove') {
		const warningID = commandArgs.shift();
		removeWarning(message, warningID);
	}
	else if (operation === 'view') {
		const data = commandArgs.shift() ?? '';

		viewWarnings(message, data);
	}
	else {
		sendError(message, `${inlineCode(operation)} is not a valid operation!\
		\n*For help, run ${inlineCode(`${BOT_PREFIX}help warn`)}*`);
	}
};
