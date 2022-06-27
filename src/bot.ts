import { config } from './private/config.js';
import './private/set-env.js';
console.log(`Bot Environment: ${config.environment}`);

import { Client } from 'discord.js';
import { INTENTS } from './config/constants.js';
import { initializeEventHandler } from './lib/event-handler.js';

const client = new Client({
	intents: INTENTS,
	presence: {
		activities: [{ name: 'over The Akialytes', type: 'WATCHING' }]
	}
});

initializeEventHandler(client);
client.login(config.token);
