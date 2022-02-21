import { Message } from 'discord.js';
import * as commands from '../commands/index.js';
import { BotCommand } from '../index.js';

export const handleCommand = async (message: Message): Promise<void> => {
	if (message.author.bot) return;

	const commandArgs: Array<string> = message.content.split(' ');
	const command: string = commandArgs[0].slice(1).toLowerCase();
	commandArgs.shift();

	const args: BotCommand = { message, command, commandArgs };
	try { commands[command as keyof typeof commands](args); }
	catch { return; } // Command does not exist
};
