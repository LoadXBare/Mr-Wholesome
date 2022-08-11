import { BotCommand, Command } from '../../index.js';
import { warning } from '../../lib/scheduler.js';

const warningReminderCommand = (args: BotCommand): void => {
	const { message } = args;
	const nextRunDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
	warning(message.client, nextRunDate);
};

export const warningReminder: Command = {
	devOnly: true,
	modOnly: false,
	run: warningReminderCommand,
	type: 'Dev'
};
