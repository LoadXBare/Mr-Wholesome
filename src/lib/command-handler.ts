import { Message } from 'discord.js';
import commands from '../commands/index.js';
import { BotCommand } from '../index.js';

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
		commands[command](args);
	}
	else {
		// Command does not exist, ignore
	}
};
