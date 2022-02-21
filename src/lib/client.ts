import { Client } from 'discord.js';
import { INTENTS } from '../config/constants.js';
import { token } from '../private/config.js';
import { initializeEventHandler } from './event-handler.js';

const client: Client = new Client({
	intents: INTENTS,
	presence: {
		activities: [{ name: 'over The Akialytes', type: 'WATCHING' }]
	}
});

initializeEventHandler(client);
client.login(token);

export default client;
