import { ColorResolvable, EmbedBuilder, Message } from 'discord.js';

export type InteractionTypes =
	| 'ignore'
	| 'role'

export type Events = {
	[event: string]: Function
}

export type CommandInfo = {
	[command: string]: EmbedBuilder
}

export type BotCommand = {
	message: Message,
	commandArgs: Array<string>
}

export type CommandTypes =
	| 'Dev'
	| 'Fun'
	| 'Information'
	| 'Moderation'
	| 'Ranking'
	| 'Utility'
	| 'Other'

export type Command = {
	type: CommandTypes,
	devOnly: boolean,
	modOnly: boolean,
	run: (args: BotCommand) => Promise<void> | void
}

export type Commands = {
	[command: string]: Command
}

export type RoleChanges =
	| 'name'
	| 'color'
	| 'hoist'
	| 'mentionable'

export type Colors = {
	COMMAND: ColorResolvable,
	SUCCESS: ColorResolvable,
	NEUTRAL: ColorResolvable,
	FAIL: ColorResolvable,
	CANCEL: ColorResolvable,
	TIMEOUT: ColorResolvable,
	NEGATIVE: ColorResolvable,
	POSITIVE: ColorResolvable
}

export type Cat = Array<{
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
}

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

export type Uptime = {
	days: number,
	hours: number,
	minutes: number,
	seconds: number
}

export type CommandsList = {
	[type in CommandTypes]: string;
};

export interface GuildRanking {
	guildID: string,
	memberID: string,
	xp: number,
	xpLevel: number,
	levelUpNotifications: boolean,
	credits: number
}

export interface XPLevelBounds {
	lower: number,
	upper: number
}

export interface MemberStats {
	guildID: string,
	memberID: string,
	messageCount: number,
	messageCountByHour: {
		[hour: string]: number
	}
}

export interface Cache {
	'wsPingHistory': Array<number>
}

interface UserCookies {
	userID: string,
	cookiesGiven: number,
	cookiesReceived: number
}
