import { Attachment, Collection, ColorResolvable, EmbedBuilder, Message } from 'discord.js';

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
	[command: string]: EmbedBuilder
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
	oldAttachments: Collection<string, Attachment>,
	newAttachments: Collection<string, Attachment>,
	message: Message
}

export type ContentUpdate = {
	oldContent: string,
	newContent: string,
	message: Message
}

export type Cat = Array<{
	breeds: Array<string>,
	id: string,
	url: string,
	width: number,
	height: number
}>

export type Dog = Array<{
	breeds: Array<string>,
	id: string,
	url: string,
	width: number,
	height: number
}>

export type Fox = {
	image: string,
	link: string
}

export type WarningCount = {
	[userID: string]: {
		warningCount: number,
		oldWarnings: boolean
	}
}

export type NoteCount = {
	[userID: string]: number
}

export type TradingCard = {
	saveOnly: boolean,
	type1: string,
	type2: string,
	displayname: string,
	fulltext: string,
	move2effect: string,
	supporteffect: string,
	references: Array<string>,
	cardtitle: string,
	hp: string,
	move1dmg: string,
	passive: string,
	trellocard: string,
	move2dmg: string,
	move1type: string,
	cardclass: string,
	move2name: string,
	move1effect: string,
	move2type: string,
	charactername: string,
	move1name: string,
	chardesc: string,
	subbed: boolean
};

export type Variables = {
	[variable: string]: string
}

export type Interactions = {
	[interaction: string]: Function
}

export type ButtonInteract = {
	type: string,
	[data: string]: string
}

export type Suffixes = {
	[num: number]: string
}
