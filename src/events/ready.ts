import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import { Client } from 'discord.js';
import { mongodb } from '../api/mongo.js';
import { log } from '../lib/misc/log.js';
import { startScheduler } from '../lib/scheduler.js';
import { config } from '../private/config.js';

export const ready = async (client: Client): Promise<void> => {
	// -- initialise various things --
	startScheduler(client);
	dayjs.extend(relativeTime);
	dayjs.extend(customParseFormat);
	dayjs.extend(utc);
	await mongodb.connectToDatabase();
	// ----

	console.log(`Bot Environment: ${config.environment}`);
	log(`Successfully logged in as ${client.user.tag}!`);
};
