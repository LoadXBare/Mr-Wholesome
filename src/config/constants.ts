import { Intents } from 'discord.js';
import { clientEventTypes, Colors } from '..';

export const PREFIX = '!';

export const COLORS: Colors = {
	COMMAND: '#704f95',
	SUCCESS: '#2f9340',
	NEUTRAL: '#337cb8',
	FAIL: '#912f2f',
	CANCEL: '#b83333',
	TIMEOUT: '#474747',
	NEGATIVE: '#ff5555',
	POSITIVE: '#079e00'
};

export const EVENTS: Array<clientEventTypes> = [
	'guildBanAdd',
	'guildBanRemove',
	'guildMemberAdd',
	'guildMemberRemove',
	'guildMemberUpdate',
	'interactionCreate',
	'messageCreate',
	'messageDelete',
	'messageUpdate',
	'ready',
	'roleCreate',
	'roleDelete',
	'roleUpdate',
	'rateLimit'
];

export const INTENTS = new Intents([
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_BANS
]);
