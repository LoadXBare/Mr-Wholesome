import { inlineCode } from '@discordjs/builders';
import { Intents, MessageEmbed } from 'discord.js';
import { Colors, CommandInfo } from '..';
import { numSuffix } from '../lib/misc/number-suffix.js';
import { config } from '../private/config.js';

export const BOT_PREFIX = config.botPrefix;

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

export const INTENTS = new Intents([
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_BANS
]);

export const COMMAND_INFO: CommandInfo = {
	'WARN': new MessageEmbed()
		.setTitle(`Command Info: "${BOT_PREFIX}warn"`)
		.setDescription('Gives a warning to, removes a warning from, or views all warnings for a specific member or all warnings within the guild.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}warn @LoadXBare#7156`)}\
				\n┗ Warns @LoadXBare#7156 without a reason.`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}warn add @LoadXBare#7156 Spamming!`)}\
				\n┗ Warns @LoadXBare#7156 with the reason "Spamming!".`
			},
			{
				name: 'Example 3',
				value: `${inlineCode(`${BOT_PREFIX}warn remove 62b5efc6219324ca036018f4`)}\
				\n┗ Removes warning with the ID "62b5efc6219324ca036018f4".`
			},
			{
				name: 'Example 4',
				value: `${inlineCode(`${BOT_PREFIX}warn view`)}\
				\n┗ Displays all warnings within the guild.`
			},
			{
				name: 'Example 5',
				value: `${inlineCode(`${BOT_PREFIX}warn view @LoadXBare#7156`)}\
				\n┗ Displays all warnings for LoadXBare#7156.`
			}
		])
		.setColor(COLORS.COMMAND),
	'PING': new MessageEmbed()
		.setTitle(`Command Info: "${BOT_PREFIX}ping"`)
		.setDescription('Views Mr Wholesome\'s ping both to Discord\'s API and you.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}ping`)}\
				\n┗ Displays Mr Wholesome's ping.`
			}
		])
		.setColor(COLORS.COMMAND),
	'HELP': new MessageEmbed()
		.setTitle(`Command Info: "${BOT_PREFIX}help"`)
		.setDescription('Displays a list of all of Mr Wholesome\'s commands separated by command type.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}help`)}\
				\n┗ Displays all of Mr Wholesome's commands.`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}help ping`)}\
				\n┗ Displays information for Mr Wholesome's "${BOT_PREFIX}ping" command.`
			}
		])
		.setColor(COLORS.COMMAND),
	'WATCHLIST': new MessageEmbed()
		.setTitle(`Command Info: "${BOT_PREFIX}watchlist"`)
		.setDescription('Add, remove or view all notes for a specific user or all notes within the guild.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}watchlist add @LoadXBare#7156 Not taking a break!`)}\
				\n┗ Adds a note to @LoadXBare#7156 with the text "Not taking a break!".`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}watchlist remove 62b7080a0a137bf45e4a9a25`)}\
				\n┗ Removes note with the ID "62b7080a0a137bf45e4a9a25" from the user it was assigned to.`
			},
			{
				name: 'Example 3',
				value: `${inlineCode(`${BOT_PREFIX}watchlist view @LoadXBare#7156`)}\
				\n┗ Displays all notes for @LoadXBare#7156.`
			},
			{
				name: 'Example 4',
				value: `${inlineCode(`${BOT_PREFIX}watchlist view`)}\
				\n┗ Displays all notes within the guild.`
			}
		])
		.setColor(COLORS.COMMAND),
	'IGNOREDCHANNEL': new MessageEmbed()
		.setTitle(`Command Info: "${BOT_PREFIX}ignoredchannel"`)
		.setDescription('Adds, removes or resets all Ignored Channels within the guild.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}ignoredchannel add #bot-commands`)}\
				\n┗ Adds the "#bot-commands" channel to the Ignored Channels list.`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}ignoredchannel remove #general`)}\
				\n┗ Removes the "#general" channel from the Ignored Channels list.`
			},
			{
				name: 'Example 3',
				value: `${inlineCode(`${BOT_PREFIX}ignoredchannel reset`)}\
				\n┗ Resets and clears the list of Ignored Channels within the guild.`
			}
		])
		.setColor(COLORS.COMMAND),
	'LOGCHANNEL': new MessageEmbed()
		.setTitle(`Command Info: "${BOT_PREFIX}logchannel"`)
		.setDescription('Sets the log channel for the guild.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}logchannel set #mod-logs`)}\
				\n┗ Sets the guild log channel to "#mod-logs".`
			}
		])
		.setColor(COLORS.COMMAND),
	'BIRTHDAY': new MessageEmbed()
		.setTitle(`Command Info: "${BOT_PREFIX}birthday"`)
		.setDescription('Sets your birthday so that Mr Wholesome can ping you on your birthday! Also allows you to view upcoming birthdays.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}birthday set 24/09`)}\
				\n┗ Sets your birthday to "24/09" (24${numSuffix(24)} September).`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}birthday upcoming`)}\
				\n┗ Displays the upcoming 4 birthdays.`
			}
		])
		.setColor(COLORS.COMMAND)
};
