import { EmbedBuilder, GatewayIntentBits, inlineCode } from 'discord.js';
import { Colors, CommandInfo } from '../index.js';
import { numSuffix } from '../lib/misc/number-suffix.js';
import { config } from '../private/config.js';

export const BOT_PREFIX = config.botPrefix;

export const xpPerMessage = {
	min: 5,
	max: 15
};

export const creditsPerMessage = {
	min: 1,
	max: 5
};

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

export const INTENTS = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildBans
];

export const COMMAND_INFO: CommandInfo = {
	'WARN': new EmbedBuilder()
		.setTitle(`Command Info: "${BOT_PREFIX}warn"`)
		.setDescription('Gives a warning to, removes a warning from, or views all warnings for a specific member or all warnings within the guild.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}warn @Akialyne#6260`)}\
				\n┗ Warns @Akialyne#6260 without a reason.`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}warn add @Akialyne#6260 Spamming!`)}\
				\n┗ Warns @Akialyne#6260 with the reason "Spamming!".`
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
				value: `${inlineCode(`${BOT_PREFIX}warn view @Akialyne#6260`)}\
				\n┗ Displays all warnings for @Akialyne#6260.`
			}
		])
		.setColor(COLORS.COMMAND),
	'PING': new EmbedBuilder()
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
	'HELP': new EmbedBuilder()
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
	'WATCHLIST': new EmbedBuilder()
		.setTitle(`Command Info: "${BOT_PREFIX}watchlist"`)
		.setDescription('Add, remove or view all notes for a specific user or all notes within the guild.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}watchlist add @Akialyne#6260 Not taking a break!`)}\
				\n┗ Adds a note to @Akialyne#6260 with the text "Not taking a break!".`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}watchlist remove 62b7080a0a137bf45e4a9a25`)}\
				\n┗ Removes note with the ID "62b7080a0a137bf45e4a9a25" from the user it was assigned to.`
			},
			{
				name: 'Example 3',
				value: `${inlineCode(`${BOT_PREFIX}watchlist view @Akialyne#6260`)}\
				\n┗ Displays all notes for @Akialyne#6260.`
			},
			{
				name: 'Example 4',
				value: `${inlineCode(`${BOT_PREFIX}watchlist view`)}\
				\n┗ Displays all notes within the guild.`
			}
		])
		.setColor(COLORS.COMMAND),
	'IGNOREDCHANNEL': new EmbedBuilder()
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
	'LOGCHANNEL': new EmbedBuilder()
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
	'BIRTHDAY': new EmbedBuilder()
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
		.setColor(COLORS.COMMAND),
	'BAN': new EmbedBuilder()
		.setTitle(`Command Info: "${BOT_PREFIX}ban"`)
		.setDescription('Allows you to ban, unban or view bans within this guild.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}ban @Akialyne#6260 1 Excessive spamming`)}\
				\n┗ Bans the user @Akialyne#6260 with the reason "Excessive spamming" and deletes their messages less than 1 day old.`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}ban add @Akialyne#6260 Spamming`)}\
				\n┗ Bans @Akialyne#6260 with the reason "Spamming" but does not delete any of their messages.`
			},
			{
				name: 'Example 3',
				value: `${inlineCode(`${BOT_PREFIX}ban @Akialyne#6260`)}\
				\n┗ Bans @Akialyne#6260 without reason and without deleting any of their messages.`
			},
			{
				name: 'Example 4',
				value: `${inlineCode(`${BOT_PREFIX}ban remove 62ee7953d6903000dc5fb0b2`)}\
				\n┗ Unbans the user tied to the specified Ban ID. (Ban can still be viewed)`
			},
			{
				name: 'Example 5',
				value: `${inlineCode(`${BOT_PREFIX}ban view`)}\
				\n┗ Displays all bans within the guild.`
			}
		])
		.setColor(COLORS.COMMAND),
	'TICKETPANEL': new EmbedBuilder()
		.setTitle(`Command Info: "${BOT_PREFIX}ticketpanel"`)
		.setDescription('Allows you to create, post and delete Ticket Panels.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}ticketpanel create`)}\
				\n┗ Begins the Ticket Panel creation process.`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}ticketpanel delete Mod Mail`)}\
				\n┗ Deletes the Ticket Panel named "Mod Mail".`
			},
			{
				name: 'Example 3',
				value: `${inlineCode(`${BOT_PREFIX}ticketpanel list`)}\
				\n┗ Lists all Ticket Panels within the guild.`
			},
			{
				name: 'Example 4',
				value: `${inlineCode(`${BOT_PREFIX}ticketpanel post #mod-mail Mod Mail`)}\
				\n┗ Posts the Ticket Panel "Mod Mail" in the "#mod-mail" channel.`
			}
		])
		.setColor(COLORS.COMMAND),
	'TOP': new EmbedBuilder()
		.setTitle(`Command Info: "${BOT_PREFIX}top"`)
		.setDescription('Allows you to view the member leaderboards.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}top`)}\
				\n┗ Displays the top 10 members within the guild.`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}top 4`)}\
				\n┗ Displays the 4th page of the member leaderboards (31st to 40th place).`
			}
		])
		.setColor(COLORS.COMMAND),
	'RANK': new EmbedBuilder()
		.setTitle(`Command Info: "${BOT_PREFIX}rank"`)
		.setDescription('Allows you to view a user\'s rank.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}rank`)}\
				\n┗ Displays your rank within the guild.`
			},
			{
				name: 'Example 2',
				value: `${inlineCode(`${BOT_PREFIX}rank @Akialyne#6260`)}\
				\n┗ Displays the rank for @Akialyne#6260 within the guild.`
			}
		])
		.setColor(COLORS.COMMAND),
	'MYSTATS': new EmbedBuilder()
		.setTitle(`Command Info: "${BOT_PREFIX}mystats"`)
		.setDescription('Allows you to view __your__ various member statistics within the guild.')
		.setFields([
			{
				name: 'Example 1',
				value: `${inlineCode(`${BOT_PREFIX}mystats`)}\
				\n┗ Displays your member statistics.`
			}
		])
		.setColor(COLORS.COMMAND)
};
