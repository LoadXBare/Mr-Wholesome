import { userMention } from '@discordjs/builders';
import { Message, MessageEmbed, User } from 'discord.js';
import { COLORS, COMMAND_INFO } from '../../config/constants';
import { emojiUrl } from '../../lib/misc/emoji-url';
import prisma from '../../prisma/client';
import { emotes } from '../../private/config';

export const removeNote = async (user: User, noteNum: number, message: Message) => {
	const notes = await prisma.userWatchlist.findMany({
		where: {
			userId: user.id
		}
	});

	if (notes.length === 0) {
		const userHasNoNotes = new MessageEmbed()
			.setAuthor({ name: 'Remove Watchlist', iconURL: emojiUrl(emotes.watchlist) })
			.setDescription(`There are no notes to remove for ${userMention(user.id)}!`)
			.setColor(COLORS.FAIL);

		message.reply({ embeds: [userHasNoNotes] });
		return;
	}

	const noteToRemove = notes.at(noteNum - 1);
	if (isNaN(noteNum) || !noteToRemove) {
		message.reply({ embeds: [COMMAND_INFO.DELETE_WATCHLIST] });
		return;
	}

	await prisma.userWatchlist.delete({
		where: {
			noteId: noteToRemove.noteId
		}
	});

	const noteRemoved = new MessageEmbed()
		.setAuthor({
			name: 'Watchlist',
			iconURL: emojiUrl(emotes.watchlist)
		})
		.setDescription(`Successfully removed note #${noteNum} from ${userMention(user.id)}!`)
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [noteRemoved] });
};
