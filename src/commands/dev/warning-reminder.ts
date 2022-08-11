import { BotCommand } from '../../index.js';
import { warning } from '../../lib/scheduler.js';

export const warningReminder = (args: BotCommand): void => {
	const { message } = args;
	const nextRunDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
	warning(message.client, nextRunDate);
};
