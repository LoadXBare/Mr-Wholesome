import { Collection, ColorResolvable, Message, MessageAttachment } from 'discord.js';

export type InteractionTypes =
	| 'ignore'
	| 'role';

export type BotInteractionInfo = {
	type: string,
	[index: string]: string
};

export type ButtonChoice = {
	type: InteractionTypes,
	value: string
}

export type ErrorInvalidArg = {
	invalidArg: string,
	passedArg: string,
	message: Message
};

export type ErrorMissingArg = {
	missingArg: string,
	message: Message
};

export type ErrorDatabaseDuplicate = {
	entry: string,
	field: string,
	message: Message
};

export type ErrorDatabaseEntryNotFound = {
	entry: string,
	field: string,
	message: Message
}

export type clientEventTypes =
	| 'guildBanAdd'
	| 'guildBanRemove'
	| 'guildMemberAdd'
	| 'guildMemberRemove'
	| 'guildMemberUpdate'
	| 'messageCreate'
	| 'interactionCreate'
	| 'messageDelete'
	| 'messageUpdate'
	| 'ready'
	| 'roleCreate'
	| 'roleDelete'
	| 'roleUpdate'
	| 'rateLimit';

export type RoleChanges =
	| 'name'
	| 'color'
	| 'hoist'
	| 'mentionable';

export type Colors = {
	COMMAND: ColorResolvable,
	SUCCESS: ColorResolvable,
	NEUTRAL: ColorResolvable,
	FAIL: ColorResolvable,
	CANCEL: ColorResolvable,
	TIMEOUT: ColorResolvable,
	NEGATIVE: ColorResolvable,
	POSITIVE: ColorResolvable
};

export type BotCommand = {
	message: Message,
	command: string,
	commandArgs: Array<string>
};

export type AttachmentUpdate = {
	oldAttachments: Collection<string, MessageAttachment>,
	newAttachments: Collection<string, MessageAttachment>,
	message: Message
}

export type ContentUpdate = {
	oldContent: string,
	newContent: string,
	message: Message
}
