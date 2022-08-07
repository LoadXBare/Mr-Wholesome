import { Message } from 'discord.js';
import commands from '../commands/index.js';
import { MOD_COMMANDS } from '../config/constants.js';
import { BotCommand } from '../index.js';
import { isModerator } from './misc/check-moderator.js';
import { log } from './misc/log.js';
import { sendError } from './misc/send-error.js';

export const handleCommand = (message: Message): void => {
	if (message.author.bot) {
		return;
	}

	const commandArgs = message.content.split(' ');
	const command = commandArgs.at(0).slice(1).toLowerCase();
	commandArgs.shift();

	const commandsList = Object.keys(commands);
	const args: BotCommand = { message, commandArgs };

	if (commandsList.includes(command)) {
		if (MOD_COMMANDS.includes(command)) {
			if (!isModerator(message.member)) {
				sendError(message, 'You do not have permission to perform this command!');
				return;
			}
		}

		commands[command](args);
		log(`Handled Command: ${command}`);
	}
	else {
		// Command does not exist, ignore
	}
};
