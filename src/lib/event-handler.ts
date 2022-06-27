import { Client } from 'discord.js';
import events from '../events/index.js';

export const initializeEventHandler = async (client: Client): Promise<void> => {
	const eventsArray = Object.keys(events);

	for (const event of eventsArray) {
		client.on(event, (...args) => {
			events[event](...args);
		});
	}
};
