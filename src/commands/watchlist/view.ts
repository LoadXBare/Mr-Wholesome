import { bold, inlineCode, time, userMention } from '@discordjs/builders';
import { userWatchlist } from '@prisma/client';
import { Client, Message, MessageEmbed, User } from 'discord.js';
import { COLORS, COMMAND_INFO, PREFIX } from '../../config/constants';
import { emojiUrl } from '../../lib/misc/emoji-url';
import prisma from '../../prisma/client';
import { emotes } from '../../private/config';

const displayAllNotes = (notes: Array<userWatchlist>, user: User) => {
	const embed = new MessageEmbed()
		.setAuthor({
			name: 'Watchlist',
			iconURL: emojiUrl(emotes.watchlist)
		})
		.setDescription('')
		.setColor(COLORS.SUCCESS);

	if (notes.length === 0) {
		embed.setDescription(`There are no notes for ${userMention(user.id)}!`);
		embed.setColor(COLORS.FAIL);
		return embed;
	}

	notes.forEach((note, index) => {
		embed.setDescription(embed.description.concat(`${inlineCode(`#${index + 1}`)} - ${time(Math.round(parseInt(note.createdTimestamp) / 1000))}\n`));
	});

	embed.setDescription(embed.description.concat(`\nTo view a specific note, use ${PREFIX}wl view ${userMention(user.id)} ${inlineCode('number')}`));

	return embed;
};

const displaySpecificNote = async (notes: Array<userWatchlist>, noteNum: number, client: Client) => {
	const note = notes.at(noteNum - 1);

	if (!note) {
		return COMMAND_INFO.VIEW_WATCHLIST;
	}

	const creator = await client.users.fetch(note.creatorId);

	const embed = new MessageEmbed()
		.setAuthor({
			name: 'Watchlist',
			iconURL: emojiUrl(emotes.watchlist)
		})
		.setDescription(`${bold(`Displaying note #${noteNum} created by ${userMention(creator.id)} at ${time(Math.round(parseInt(note.createdTimestamp) / 1000))}`)}\
		\n${note.noteText}`)
		.setColor(COLORS.SUCCESS);

	return embed;
};

const displayAllGuildNotes = async () => {
	const notes = await prisma.userWatchlist.findMany();
	const embed = new MessageEmbed()
		.setAuthor({ name: 'Watchlist', iconURL: emojiUrl(emotes.watchlist) })
		.setColor(COLORS.SUCCESS);
	let embedDescription = 'Displaying all notes within this guild.\n\n';

	const userIds: Array<string> = [];
	for (let i = 0; i < notes.length; i++) {
		if (!userIds.includes(notes[i].userId))
			userIds.push(notes[i].userId);
	}

	for (let i = 0; i < userIds.length; i++) {
		const notesForUser = await prisma.userWatchlist.findMany({ where: { userId: userIds[i] } });
		embedDescription += `• ${userMention(userIds[i])} - ${notesForUser.length} note(s)\n`;
	}

	embed.setDescription(embedDescription);
	return embed;
};

export const viewNotes = async (user: User, message: Message, noteNum: number) => {
	let notesList: MessageEmbed;

	if (!user)
		notesList = await displayAllGuildNotes();
	else {
		const notes = await prisma.userWatchlist.findMany({ where: { userId: user.id } });
		if (!noteNum)
			notesList = displayAllNotes(notes, user);
		else
			notesList = await displaySpecificNote(notes, noteNum, message.client);
	}

	message.reply({ embeds: [notesList] });
};
