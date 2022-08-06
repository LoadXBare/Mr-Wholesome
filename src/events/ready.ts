import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import { Client } from 'discord.js';
import { mongodb } from '../api/mongo.js';
import { LOG_COLORS } from '../config/constants.js';
import { startScheduler } from '../lib/scheduler.js';

export const ready = async (client: Client): Promise<void> => {
	// -- initialise various things --
	startScheduler(client);
	dayjs.extend(relativeTime);
	dayjs.extend(customParseFormat);
	await mongodb.connectToDatabase();
	// ----

	console.log(LOG_COLORS.SUCCESS(`Successfully logged in as ${client.user.tag}!`));
};
