import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import utc from 'dayjs/plugin/utc.js';
import { Client } from 'discord.js';
import { mongodb } from '../api/mongo.js';
import { cache } from '../config/cache.js';
import { log } from '../lib/misc/log.js';
import { startScheduler } from '../lib/scheduler.js';
import { config } from '../private/config.js';

export class Ready {
	private client: Client;

	constructor(client: Client) {
		this.client = client;
		this.init();
	}

	private async init(): Promise<void> {
		await mongodb.connectToDatabase();
		dayjs.extend(relativeTime);
		dayjs.extend(customParseFormat);
		dayjs.extend(utc);
		await cache.initialise();
		startScheduler(this.client);

		this.ready();
	}

	private ready(): void {
		const { tag, id } = this.client.user;
		console.log(`Bot Environment: ${config.environment}`);
		log(`Successfully logged in as ${tag}! (${id})`);
	}
}

export const ready = (client: Client): void => {
	new Ready(client);
};
