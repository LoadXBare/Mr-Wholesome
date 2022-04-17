import { MessageEmbed, User } from 'discord.js';
import { BotCommand } from '../..';
import { COLORS, COMMAND_INFO } from '../../config/constants';
import { emojiUrl } from '../../lib/misc/emoji-url';
import { emotes } from '../../private/config';
import { addNote } from './add';
import { removeNote } from './remove';
import { viewNotes } from './view';

export const wl = async (args: BotCommand) => {
	const { commandArgs, message } = args;

	if (!message.member.permissions.has('KICK_MEMBERS')) {
		const invalidPermission = new MessageEmbed()
			.setAuthor({ name: 'Watchlist', iconURL: emojiUrl(emotes.watchlist) })
			.setDescription('You do not have permission to perform this command!')
			.setColor(COLORS.FAIL);
		message.reply({ embeds: [invalidPermission] });
		return;
	}

	if (commandArgs.length < 1) {
		message.reply({ embeds: [COMMAND_INFO.WATCHLIST] });
		return;
	}
	const operation = commandArgs.shift() ?? '';
	const target = commandArgs.shift() ?? '';
	const userId = target.replace(/\D/g, '');
	let user: User;
	if (!(operation === 'view' && target === '')) {
		try {
			user = await message.client.users.fetch(userId);
		} catch {
			message.reply({ embeds: [COMMAND_INFO.WATCHLIST] });
			return;
		}
	}
	const creator = message.author;

	if (operation === 'add') {
		const noteText = commandArgs.join(' ');
		addNote(user, noteText, creator, message);
	} else if (operation === 'view') {
		const noteNum = parseInt(commandArgs.shift());
		viewNotes(user, message, noteNum);
	} else if (operation === 'remove') {
		const noteNum = parseInt(commandArgs.shift());
		removeNote(user, noteNum, message);
	}
};
