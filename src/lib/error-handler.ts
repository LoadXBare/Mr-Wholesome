import { inlineCode } from '@discordjs/builders';
import { Message, MessageEmbed } from 'discord.js';
import { ErrorInvalidArg, ErrorMissingArg, ErrorDatabaseDuplicate, ErrorDatabaseEntryNotFound } from '..';
import { COLORS } from '../config/constants';

export const sendError = (message: Message, errorEmbed: MessageEmbed) => {
	message.reply({ embeds: [errorEmbed] });
};

class errorBase {
	constructor() {
		return new MessageEmbed()
			.setTitle(':warning: Error')
			.setColor(COLORS.FAIL);
	}
}

const invalidArg = ({ ...args }: ErrorInvalidArg) => {
	const invalidArgError = new MessageEmbed(new errorBase())
		.setDescription(`Value ${inlineCode(args.passedArg)} is invalid for argument ${inlineCode(args.invalidArg)}`);
	sendError(args.message, invalidArgError);
};

const missingArg = ({ ...args }: ErrorMissingArg) => {
	const missingArgError = new MessageEmbed(new errorBase())
		.setDescription(`Missing required argument: ${inlineCode(args.missingArg)}`);
	sendError(args.message, missingArgError);
};

const databaseDuplicateEntry = ({ ...args }: ErrorDatabaseDuplicate) => {
	const databaseDuplicateEntryError = new MessageEmbed(new errorBase())
		.setDescription(`${inlineCode(args.entry)} is already present within the ${inlineCode(args.field)} list!`);
	sendError(args.message, databaseDuplicateEntryError);
};

const databaseEntryNotFound = ({ ...args }: ErrorDatabaseEntryNotFound) => {
	const databaseEntryNotFoundError = new MessageEmbed(new errorBase())
		.setDescription(`${inlineCode(args.entry)} is not present within the ${inlineCode(args.field)} list!`);
	sendError(args.message, databaseEntryNotFoundError);
};

export const handleError = {
	invalidArg,
	missingArg,
	databaseDuplicateEntry,
	databaseEntryNotFound
};
