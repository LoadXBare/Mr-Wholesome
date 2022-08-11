import dayjs from 'dayjs';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, codeBlock, ComponentType, EmbedBuilder, inlineCode, Message, User } from 'discord.js';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { BotCommand } from '../../index.js';
import { fetchDiscordUser } from '../../lib/misc/fetch-discord-user.js';
import { sendError } from '../../lib/misc/send-error.js';
import { sleep } from '../../lib/misc/sleep.js';

const addBan = async (message: Message, bannedUser: User, reason: string, days: number): Promise<void> => {
	const creatorUserID = message.author.id;
	const bannedUserID = bannedUser.id;

	const banEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Ban')
		.setDescription(`You're about to ban ${inlineCode(bannedUser.tag)}, is everything correct?`)
		.setFields([
			{
				name: 'Reason',
				value: reason
			},
			{
				name: 'Number of days of messages to delete',
				value: days.toString()
			}
		])
		.setColor(COLORS.COMMAND);

	const confirmButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'YesDM' }))
			.setLabel('Yes')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'No' }))
			.setLabel('No')
			.setStyle(ButtonStyle.Danger),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'Yes' }))
			.setLabel('Yes (Don\'t DM)')
			.setStyle(ButtonStyle.Secondary)
	);

	const commandReply = await message.reply({ embeds: [banEmbed], components: [confirmButtons] });

	const interactionFilter = (interaction: ButtonInteraction): boolean => {
		return interaction.user.id === creatorUserID;
	};

	const buttonChoice = await message.channel.awaitMessageComponent({ componentType: ComponentType.Button, idle: 30_000, filter: interactionFilter }).catch(() => { });

	if (typeof buttonChoice === 'undefined') {
		const banTimeoutEmbed = EmbedBuilder.from(banEmbed)
			.setFooter({ text: 'Ban timed out.' })
			.setColor(COLORS.TIMEOUT);

		commandReply.edit({ embeds: [banTimeoutEmbed], components: [] });
		return;
	}

	const choice = JSON.parse(buttonChoice.customId).value;

	if (choice === 'YesDM' || choice === 'Yes') {
		const ban = await mongodb.guildBan.create({
			banDate: dayjs().toISOString(),
			bannedUserID: bannedUserID,
			banReason: reason,
			creatorUserID: creatorUserID,
			guildID: message.guildId,
			unbanned: false
		});

		const banSentEmbed = EmbedBuilder.from(banEmbed)
			.setDescription('Member banned and successfully DMed!')
			.setFields()
			.setFooter({ text: `Ban ID: ${ban._id}` })
			.setColor(COLORS.SUCCESS);

		if (choice === 'YesDM') {
			const banDMEmbed = new EmbedBuilder()
				.setDescription(`You have been banned from **${message.guild.name}**.`)
				.setFields([
					{
						name: 'Reason',
						value: reason
					}
				])
				.setColor(COLORS.NEGATIVE)
				.setTimestamp();

			try {
				await bannedUser.send({ embeds: [banDMEmbed] });
			}
			catch {
				banSentEmbed
					.setDescription('Member banned!\
					\n(However there was a problem DMing the member)')
					.setColor('Yellow');
			}
		}
		else {
			banSentEmbed
				.setDescription('Member banned!');
		}

		try {
			await sleep(1000); // This is required to combat a rare error that can occur when the user is banned faster than it takes the "guildBanAdd" event to run causing a null error when reading "member.displayAvatarURL()".
			await message.guild.bans.create(bannedUser, { deleteMessageDays: days, reason: reason });
		}
		catch (e) {
			await commandReply.delete();
			sendError(message, `The following error occurred while attempting to ban ${inlineCode(bannedUser.tag)}:\
			\n${codeBlock(e)}\
			\n**The member may have still been DMed and an entry added to the database!**`);
			return;
		}
		commandReply.edit({ embeds: [banSentEmbed], components: [] });
	}
	else {
		const banCancelledEmbed = EmbedBuilder.from(banEmbed)
			.setFooter({ text: 'Ban cancelled.' })
			.setColor(COLORS.NEGATIVE);

		commandReply.edit({ embeds: [banCancelledEmbed], components: [] });
	}
};

const removeBan = async (banID: string, message: Message): Promise<void> => {
	const ban = await mongodb.guildBan.findById(banID).catch(() => { });

	if (typeof ban === 'undefined') {
		sendError(message, `${inlineCode(banID)} is not a valid Ban ID!`);
		return;
	}

	const creatorUser = await fetchDiscordUser(message.client, ban.creatorUserID);
	const bannedUser = await fetchDiscordUser(message.client, ban.bannedUserID);

	const unbanEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setDescription(`Are you sure you want to unban ${inlineCode(bannedUser.tag)}?`)
		.setFields([
			{
				name: 'Banned By',
				value: creatorUser.tag
			},
			{
				name: 'Banned On',
				value: dayjs(ban.banDate).format('MMMM DD, YYYY [at] hh:mma UTC')
			},
			{
				name: 'Reason',
				value: ban.banReason
			}
		])
		.setColor(COLORS.COMMAND);

	const confirmButtons = new ActionRowBuilder<ButtonBuilder>().setComponents(
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'Yes' }))
			.setLabel('Yes')
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId(JSON.stringify({ type: 'ignore', value: 'No' }))
			.setLabel('No')
			.setStyle(ButtonStyle.Danger)
	);

	const commandReply = await message.reply({ embeds: [unbanEmbed], components: [confirmButtons] });

	const interactionFilter = (interaction: ButtonInteraction): boolean => {
		return interaction.user.id === message.author.id;
	};

	const buttonChoice = await message.channel.awaitMessageComponent({ componentType: ComponentType.Button, idle: 30_000, filter: interactionFilter }).catch(() => { });

	if (typeof buttonChoice === 'undefined') {
		const unbanTimeoutEmbed = EmbedBuilder.from(unbanEmbed)
			.setFooter({ text: 'Unban timed out.' })
			.setColor(COLORS.TIMEOUT);

		commandReply.edit({ embeds: [unbanTimeoutEmbed], components: [] });
		return;
	}

	const choice = JSON.parse(buttonChoice.customId).value;

	if (choice === 'Yes') {
		await mongodb.guildBan.findByIdAndUpdate(banID, {
			$set: { unbanned: true }
		});

		try {
			await message.guild.bans.remove(bannedUser);
		}
		catch (e) {
			await commandReply.delete();
			sendError(message, `The following error occurred while attempting to unban ${inlineCode(bannedUser.tag)}:\
			\n${codeBlock(e)}\
			\n**The ban entry within the database has still been updated!**`);
			return;
		}

		const memberUnbannedEmbed = EmbedBuilder.from(unbanEmbed)
			.setDescription(`${inlineCode(bannedUser.tag)} has successfully been unbanned!`)
			.setFields()
			.setColor(COLORS.SUCCESS);

		commandReply.edit({ embeds: [memberUnbannedEmbed], components: [] });
	}
	else {
		const unbanCancelledEmbed = EmbedBuilder.from(unbanEmbed)
			.setFooter({ text: 'Unban cancelled.' })
			.setColor(COLORS.NEGATIVE);

		commandReply.edit({ embeds: [unbanCancelledEmbed], components: [] });
	}
};

const viewBans = async (banID: string, message: Message): Promise<void> => {
	const viewGuildBans = async (): Promise<void> => {
		const guildBansList = await mongodb.guildBan.find({
			guildID: message.guildId
		});

		let bansList = '';

		if (guildBansList.length === 0) {
			bansList = 'There are no bans within this guild! 🎉';
		}

		for (const ban of guildBansList) {
			const currentUser = await fetchDiscordUser(message.client, ban.bannedUserID);
			let banText = '';

			if (ban.unbanned) {
				banText = `• ~~${inlineCode(currentUser.tag)} - ${ban._id}~~ **[UNBANNED]**\n`;
			}
			else {
				banText = `• ${inlineCode(currentUser.tag)} - ${ban._id}\n`;
			}
			bansList = bansList.concat(banText);
		}

		const bansListEmbed = new EmbedBuilder()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.member.displayAvatarURL()
			})
			.setTitle(`Displaying all banned users within ${message.guild.name}`)
			.setDescription(bansList)
			.setColor(COLORS.COMMAND);

		message.reply({ embeds: [bansListEmbed] });
	};

	const viewUserBan = async (): Promise<void> => {
		const ban = await mongodb.guildBan.findById(banID).catch(() => { });

		if (typeof ban === 'undefined') {
			sendError(message, `${inlineCode(banID)} is not a valid Ban ID!`);
			return;
		}

		const bannedUser = await fetchDiscordUser(message.client, ban.bannedUserID);
		const creatorUser = await fetchDiscordUser(message.client, ban.creatorUserID);
		const unbannedNotice = '__**This member has since been unbanned!**__';

		const banEmbed = new EmbedBuilder()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.member.displayAvatarURL()
			})
			.setTitle(`Displaying ban information for ${inlineCode(bannedUser.tag)}`)
			.setDescription(ban.unbanned ? unbannedNotice : null)
			.setFields([
				{
					name: 'Banned By',
					value: creatorUser.tag
				},
				{
					name: 'Banned On',
					value: dayjs(ban.banDate).format('MMMM DD, YYYY [at] hh:mma UTC')
				},
				{
					name: 'Ban Reason',
					value: ban.banReason
				}
			])
			.setColor(COLORS.COMMAND);

		message.reply({ embeds: [banEmbed] });
	};

	if (typeof banID === 'undefined') {
		viewGuildBans();
	}
	else {
		viewUserBan();
	}
};

const handleBanAdd = (commandArgs: Array<string>, message: Message, user: User): void => {
	const daysText = commandArgs.shift();
	let banReason = commandArgs.join(' ');
	let daysNumber = parseInt(daysText);

	if (isNaN(daysNumber)) {
		daysNumber = 0;
		banReason = `${daysText} ${banReason}`.trim();
	}

	if (daysNumber < 0 || daysNumber > 7) {
		sendError(message, 'Number of days of messages to delete must be between 0 and 7 (inclusive)!');
		return;
	}


	if (banReason.length === 0 || banReason === 'undefined') {
		banReason = 'No reason provided.';
	}

	addBan(message, user, banReason, daysNumber);
};

export const ban = async (args: BotCommand): Promise<void> => {
	const { message, commandArgs } = args;
	const operation = (commandArgs.shift() ?? 'undefined').toLowerCase();
	const user = await fetchDiscordUser(message.client, operation.replace(/\D/g, ''));

	if (user !== null) {
		handleBanAdd(commandArgs, message, user);
	}
	else if (operation === 'add') {
		const bannedUserID = commandArgs.shift() ?? 'undefined';
		const bannedUser = await fetchDiscordUser(message.client, bannedUserID.replace(/\D/g, ''));

		if (bannedUser === null) {
			sendError(message, `${inlineCode(bannedUserID)} is not a valid User!`);
			return;
		}

		handleBanAdd(commandArgs, message, bannedUser);
	}
	else if (operation === 'remove') {
		const banID = commandArgs.shift() ?? 'undefined';

		removeBan(banID, message);
	}
	else if (operation === 'view') {
		const banID = commandArgs.shift();

		viewBans(banID, message);
	}
	else {
		sendError(message, `${inlineCode(operation)} is not a valid User or operation!\
		\n*For help, run ${inlineCode(`${BOT_PREFIX}help ban`)}*`);
	}
};
