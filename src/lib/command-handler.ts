import { Message } from 'discord.js';
import { commands } from '../commands/index.js';
import { BotCommand } from '../index.js';
import { config } from '../private/config.js';
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
		if (commands[command].modOnly && !isModerator(message.member)) {
			sendError(message, 'You do not have permission to perform this command!');
			return;
		}
		else if (commands[command].devOnly && message.author.id !== config.userIDs.LoadXBare) {
			sendError(message, 'You do not have permission to perform this command!');
			return;
		}

		commands[command].run(args);
		log(`Handled Command: ${command}`);
	}
	else {
		// Command does not exist, ignore
	}
};
