import { inlineCode } from '@discordjs/builders';
import dayjs from 'dayjs';
import { Message, MessageEmbed, User } from 'discord.js';
import { BotCommand } from '../..';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { isModerator } from '../../lib/misc/check-moderator.js';
import { fetchDiscordUser } from '../../lib/misc/fetch-discord-user.js';
import { sendError } from '../../lib/misc/send-error.js';

type NoteCount = {
	[userID: string]: number
}

const addNote = async (creatorUser: User, watchedUser: User, noteText: string, message: Message): Promise<void> => {
	const note = await mongodb.userWatchlist.create({
		creatorUserID: creatorUser.id,
		watchedUserID: watchedUser.id,
		guildID: message.guildId,
		noteText: noteText
	});

	const noteAddedEmbed = new MessageEmbed()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Watchlist')
		.setDescription(`Successfully attached note to ${inlineCode(watchedUser.tag)}`)
		.setFields([
			{
				name: 'Added By',
				value: creatorUser.tag
			},
			{
				name: 'Added On',
				value: dayjs(note.creationDate).format('MMMM DD, YYYY [at] hh:mma UTC')
			},
			{
				name: 'Note Text',
				value: noteText
			}
		])
		.setFooter({ text: `Note ID: ${note._id.toString()}` })
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [noteAddedEmbed] });
};

const removeNote = async (noteID: string, message: Message): Promise<void> => {
	const removedNote = await mongodb.userWatchlist.findByIdAndDelete(noteID).catch(() => { });

	if (typeof removedNote === 'undefined') {
		sendError(message, `${inlineCode(noteID)} is not a valid Note ID!`);
		return;
	}

	const noteRemovedEmbed = new MessageEmbed()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Remove Note')
		.setDescription('Note successfully removed!')
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [noteRemovedEmbed] });
};

const viewNotes = async (message: Message, data: string): Promise<void> => {
	const watchedUserID = data.replace(/\D/g, '');
	const watchedUser = await fetchDiscordUser(message.client, watchedUserID);
	const noteID = data;
	const note = await mongodb.userWatchlist.findById(noteID).catch(() => { });

	const displayGuildNotes = async (): Promise<void> => {
		const notes = await mongodb.userWatchlist.find({
			guildID: message.guildId
		});

		let notesList = '';
		const userNotesCount: NoteCount = {};
		for (const note of notes) {
			const userCount = userNotesCount[note.watchedUserID];

			if (typeof userCount === 'undefined') {
				userNotesCount[note.watchedUserID] = 0;
			}

			userNotesCount[note.watchedUserID] += 1;
		}

		for (const watchedUserID in userNotesCount) {
			const watchedUser = await fetchDiscordUser(message.client, watchedUserID);
			const noteCount = userNotesCount[watchedUserID];

			notesList = notesList.concat(`**${watchedUser.tag}** - ${noteCount} note(s)\n`);
		}

		const guildNotesEmbed = new MessageEmbed()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.member.displayAvatarURL()
			})
			.setTitle(`Displaying all notes within ${message.guild.name}`)
			.setDescription(notesList)
			.setColor(COLORS.COMMAND);

		message.reply({ embeds: [guildNotesEmbed] });
	};

	const displayUserNotes = async (): Promise<void> => {
		const notes = await mongodb.userWatchlist.find({
			watchedUserID: watchedUserID
		});

		let notesList = '';
		if (notes.length === 0) {
			notesList = '**This user has no notes!** 🎉';
		}
		else {
			for (const note of notes) {
				const index = notes.indexOf(note) + 1;
				notesList = notesList.concat(`**#${index}** - ${inlineCode(note._id.toString())}\n`);
			}
		}

		const notesListEmbed = new MessageEmbed()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.member.displayAvatarURL()
			})
			.setTitle(`Displaying all notes for ${inlineCode(watchedUser.tag)}`)
			.setDescription(`If you would like more information on a specific note run ${inlineCode(`${BOT_PREFIX}watchlist view [Note ID]`)}, for example: ${inlineCode(`${BOT_PREFIX}watchlist view 62b61f8924a5915ff1e5a62c`)}.\
			\n\n${notesList}`)
			.setColor(COLORS.COMMAND);

		message.reply({ embeds: [notesListEmbed] });
	};

	const displaySpecificNote = async (): Promise<void> => {
		if (typeof note === 'undefined') return; // This is required to satisfy TypeScript's engine, else it still thinks "note" has type "void", will be removed if better alternative found

		const creatorUser = await fetchDiscordUser(message.client, note.creatorUserID);
		const specificNoteEmbed = new MessageEmbed()
			.setAuthor({
				name: message.author.tag,
				iconURL: message.member.displayAvatarURL()
			})
			.setTitle(`Displaying Note: "${noteID}"`)
			.setFields([
				{
					name: 'Added By',
					value: creatorUser.tag
				},
				{
					name: 'Added On',
					value: dayjs(note.creationDate).format('MMMM DD, YYYY [at] hh:mma UTC')
				},
				{
					name: 'Note Text',
					value: note.noteText
				}
			])
			.setColor(COLORS.COMMAND);

		message.reply({ embeds: [specificNoteEmbed] });
	};

	if (watchedUser !== null) {
		displayUserNotes();
	}
	else if (typeof note !== 'undefined') {
		displaySpecificNote();
	}
	else if (data.length === 0) {
		displayGuildNotes();
	}
	else {
		sendError(message, `${inlineCode(data)} is not a valid User or Note ID!`);
	}
};

export const watchlist = async (args: BotCommand): Promise<void> => {
	const { commandArgs, message } = args;

	if (!isModerator(message.member)) {
		sendError(message, 'You do not have permission to perform this command!');
		return;
	}

	const operation = commandArgs.shift() ?? 'undefined';

	if (operation === 'add') {
		const watchedUserID = (commandArgs.shift() ?? 'undefined').toLowerCase();
		const watchedUser = await fetchDiscordUser(message.client, watchedUserID.replace(/\D/g, ''));

		if (watchedUser === null) {
			sendError(message, `${inlineCode(watchedUserID)} is not a valid User!`);
			return;
		}

		let noteText = commandArgs.join(' ');
		if (noteText.length === 0) {
			noteText = 'No text provided.';
		}

		addNote(message.author, watchedUser, noteText, message);
	}
	else if (operation === 'remove') {
		const noteID = commandArgs.shift() ?? 'undefined';

		removeNote(noteID, message);
	}
	else if (operation === 'view') {
		const data = commandArgs.shift() ?? '';

		viewNotes(message, data);
	}
	else {
		sendError(message, `${inlineCode(operation)} is not a valid operation!\
		\n*For help, run ${inlineCode(`${BOT_PREFIX}help watchlist`)}*`);
	}
};
