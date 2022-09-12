import { EmbedBuilder, inlineCode, userMention } from 'discord.js';
import { BotCommand, Command } from '../..';
import { fetchUserCookies, updateUserCookies } from '../../api/user-cookies.js';
import { COLORS } from '../../config/constants.js';
import { fetchDiscordUser } from '../../lib/misc/fetch-discord-user.js';
import { sendError } from '../../lib/misc/send-error.js';

const cookieCommand = async (args: BotCommand): Promise<void> => {
	const { message, commandArgs } = args;
	const userIDToGiveCookieText = commandArgs.shift() ?? 'undefined';
	const userIdToGiveCookie = userIDToGiveCookieText.replace(/\D/g, '');
	const userToGiveCookie = await fetchDiscordUser(message.client, userIdToGiveCookie);

	if (userToGiveCookie === null) {
		sendError(message, `${inlineCode(userIDToGiveCookieText)} is not a valid User!`);
		return;
	}
	else if (userToGiveCookie.id === message.author.id) {
		sendError(message, 'You cannot give a cookie to yourself!\
		\n*Eat it instead :p*');
		return;
	}

	const cookieGiverData = await fetchUserCookies(message.author.id);
	const cookieReceiverData = await fetchUserCookies(userToGiveCookie.id);
	cookieGiverData.cookiesGiven += 1;
	cookieReceiverData.cookiesReceived += 1;

	await updateUserCookies(cookieGiverData);
	await updateUserCookies(cookieReceiverData);

	const cookieGivenEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.author.displayAvatarURL()
		})
		.setTitle('Cookie given!')
		.setDescription(`**${message.member.displayName}** gave ${userMention(userToGiveCookie.id)} a cookie! 🍪\
		\n\n`)
		.setColor(COLORS.COMMAND);
};

export const cookie: Command = {
	devOnly: true,
	modOnly: false,
	run: cookieCommand,
	type: 'Fun'
};
