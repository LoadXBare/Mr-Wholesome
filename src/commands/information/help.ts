import { EmbedBuilder, inlineCode } from 'discord.js';
import { BOT_PREFIX, COLORS, COMMAND_INFO } from '../../config/constants.js';
import { BotCommand, Command, CommandsList } from '../../index.js';
import { sendError } from '../../lib/misc/send-error.js';
import { commands } from '../index.js';

const helpCommand = (args: BotCommand): Promise<void> => {
	const { message, commandArgs } = args;
	const P = BOT_PREFIX;

	if (commandArgs.length > 0) {
		const commandsList = Object.keys(commands);
		const command = commandArgs.shift();

		if (commandsList.includes(command)) {
			if (!(command.toUpperCase() in COMMAND_INFO)) {
				sendError(message, `The command "${inlineCode(`${P}${command}`)}" does not seem to have any additional help information.`);
				return;
			}

			const commandInfoEmbed = COMMAND_INFO[command.toUpperCase()];
			message.reply({ embeds: [commandInfoEmbed] });
		}
		else {
			sendError(message, `${inlineCode(command)} is not a valid command!`);
		}

		return;
	}

	const commandsList: CommandsList = {
		Dev: '',
		Fun: '',
		Information: '',
		Moderation: '',
		Ranking: '',
		Utility: '',
		Other: ''
	};
	for (const [cmd, cmdConfig] of Object.entries(commands)) {
		const modOnlyCommand = cmdConfig.modOnly ? '🛡️' : '';
		commandsList[cmdConfig.type] = commandsList[cmdConfig.type].concat(`${inlineCode(`${modOnlyCommand}${P}${cmd}`)} `);
	}

	const helpMenuEmbed = new EmbedBuilder()
		.setTitle('Available Commands')
		.setDescription(`You can get more detailed information on a command by running ${inlineCode(`${P}help [command]`)}, for example: ${inlineCode(`${P}help ping`)}`)
		.setFields([
			{
				name: '📋 Information',
				value: commandsList.Information
			},
			{
				name: '🛡️ Moderation',
				value: commandsList.Moderation
			},
			{
				name: '🛠️ Utility',
				value: commandsList.Utility
			},
			{
				name: '🎉 Fun',
				value: commandsList.Fun
			},
			{
				name: '🏆 Ranking',
				value: commandsList.Ranking
			}
		])
		.setFooter({ text: '🛡️ = Moderator command' })
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [helpMenuEmbed] });
};

export const help: Command = {
	devOnly: false,
	modOnly: false,
	run: helpCommand,
	type: 'Information'
};
