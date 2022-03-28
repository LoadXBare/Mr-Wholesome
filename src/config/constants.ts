import { inlineCode } from '@discordjs/builders';
import { Intents, MessageEmbed } from 'discord.js';
import { clientEventTypes, Colors } from '..';
import { emojiUrl } from '../lib/misc/emoji-url.js';
import { emotes } from '../private/config.js';

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

export const COMMAND_INFO = {
	WARN: new MessageEmbed()
		.setAuthor({ name: 'Command Info: "Warn"', iconURL: emojiUrl(emotes.info) })
		.setDescription('Gives a warning to the specified member, the member will be DMed with the provided reason.')
		.setFields([
			{
				name: 'Usage',
				value: inlineCode(`${PREFIX}warn <@Member | User ID> [reason]`)
			},
			{
				name: 'Example 1',
				value: inlineCode(`${PREFIX}warn @Member#1234 Did a bad!`)
			},
			{
				name: 'Example 2',
				value: inlineCode(`${PREFIX}warn 112233445566778899`)
			}
		])
		.setColor(COLORS.COMMAND)
		.setFooter({ text: 'Command parameters encased in [square brackets] are optional!' }),
	WARNINGS: new MessageEmbed()
		.setAuthor({ name: 'Command Info: "Warnings"', iconURL: emojiUrl(emotes.info) })
		.setDescription('Lists all warnings given to the specified member within the guild.')
		.setFields([
			{
				name: 'Usage',
				value: inlineCode(`${PREFIX}warnings <@Member | User ID>`)
			},
			{
				name: 'Example 1',
				value: inlineCode(`${PREFIX}warnings @Member#1234`)
			}
		])
		.setColor(COLORS.COMMAND),
	DELETE_WARNING: new MessageEmbed()
		.setAuthor({ name: 'Command Info: "Delete Warning"', iconURL: emojiUrl(emotes.info) })
		.setDescription('Deletes the specified warning for the specified member.')
		.setFields([
			{
				name: 'Usage',
				value: inlineCode(`${PREFIX}delwarn <@Member | User ID> <Warning ID>`)
			},
			{
				name: 'Example 1',
				value: inlineCode(`${PREFIX}delwarn @Member#1234 ABC123`)
			}
		])
		.setColor(COLORS.COMMAND)
};
