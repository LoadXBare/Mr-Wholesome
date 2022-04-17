import { inlineCode, userMention } from '@discordjs/builders';
import { Message, MessageEmbed, User } from 'discord.js';
import { COLORS } from '../../config/constants';
import { emojiUrl } from '../../lib/misc/emoji-url';
import { generateId } from '../../lib/misc/generate-id';
import prisma from '../../prisma/client';
import { emotes } from '../../private/config';

export const addNote = async (user: User, note: string, creator: User, message: Message) => {
	if (note.length === 0)
		note = inlineCode('No text provided.');

	const noteId = generateId(10);
	await prisma.userWatchlist.create({
		data: {
			createdTimestamp: Date.now().toString(),
			creatorId: creator.id,
			noteId: noteId,
			noteText: note,
			userId: user.id
		}
	});

	const success = new MessageEmbed()
		.setAuthor({
			name: 'Watchlist',
			iconURL: emojiUrl(emotes.watchlist)
		})
		.setDescription(`Successfully attached note to ${userMention(user.id)}`)
		.setFooter({ text: `Note ID: ${noteId}` })
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [success] });
};
