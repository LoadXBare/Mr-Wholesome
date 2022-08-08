import { BotCommand } from '../..';
import { warning } from '../../lib/scheduler.js';

export const warningReminder = (args: BotCommand): void => {
	const { message } = args;
	const nextRunDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
	warning(message.client, nextRunDate);
};
