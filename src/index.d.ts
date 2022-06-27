import { Collection, ColorResolvable, Message, MessageAttachment, MessageEmbed } from 'discord.js';

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

export type Events = {
	[event: string]: Function
}

export type CommandInfo = {
	[command: string]: MessageEmbed
}

export type Commands = {
	[command: string]: Function
}

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
