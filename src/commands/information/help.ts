import { inlineCode } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { BOT_PREFIX, COLORS, COMMAND_INFO } from '../../config/constants.js';
import { BotCommand } from '../../index.js';
import { sendError } from '../../lib/misc/send-error.js';
import commands from '../index.js';

export const help = (args: BotCommand): Promise<void> => {
	const { message, commandArgs } = args;
	const P = BOT_PREFIX;

	if (commandArgs.length > 0) {
		const commandsList = Object.keys(commands);
		const command = commandArgs.shift();

		if (commandsList.includes(command)) {
			const commandInfoEmbed = COMMAND_INFO[command.toUpperCase()];

			if (typeof commandInfoEmbed === 'undefined') {
				sendError(message, `The command "${inlineCode(`${BOT_PREFIX}${command}`)}" does not seem to have any additional help information.`);
			}
			else {
				message.reply({ embeds: [COMMAND_INFO[command.toUpperCase()]] });
			}
		}
		else {
			sendError(message, `${inlineCode(command)} is not a valid command!`);
		}

		return;
	}

	// -- This section will be re-written at a later date to remove hard-coded values --
	const informationCommands = ['help', 'ping'];
	const moderationCommands = ['warn', 'watchlist'];
	const utilityCommands = ['tcg', 'ignoredchannel', 'logchannel'];
	const funCommands = ['birthday', 'dog', 'cat', 'fox'];

	let informationCommandsList = '';
	let moderationCommandsList = '';
	let utilityCommandsList = '';
	let funCommandsList = '';
	for (const cmd of informationCommands) {
		informationCommandsList = informationCommandsList.concat(`${inlineCode(`${P}${cmd}`)} `);
	}
	for (const cmd of moderationCommands) {
		moderationCommandsList = moderationCommandsList.concat(`${inlineCode(`${P}${cmd}`)} `);
	}
	for (const cmd of utilityCommands) {
		utilityCommandsList = utilityCommandsList.concat(`${inlineCode(`${P}${cmd}`)} `);
	}
	for (const cmd of funCommands) {
		funCommandsList = funCommandsList.concat(`${inlineCode(`${P}${cmd}`)} `);
	}
	// ----

	const helpMenuEmbed = new MessageEmbed()
		.setTitle('Available Commands')
		.setDescription(`You can get more detailed information on a command by running ${inlineCode(`${P}help [command]`)}, for example: ${inlineCode(`${P}help ping`)}`)
		.setFields([
			{
				name: '📋 Information',
				value: informationCommandsList
			},
			{
				name: '🛡️ Moderation',
				value: moderationCommandsList
			},
			{
				name: '🛠️ Utility',
				value: utilityCommandsList
			},
			{
				name: '🎉 Fun',
				value: funCommandsList
			},
			{
				name: '🏆 Ranking',
				value: '`soon™️`'
			}
		])
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [helpMenuEmbed] });
};
