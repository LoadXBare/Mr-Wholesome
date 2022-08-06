import { config } from './private/config.js';
import './private/set-env.js';

import { Client } from 'discord.js';
import { INTENTS, LOG_COLORS } from './config/constants.js';
import { initializeEventHandler } from './lib/event-handler.js';

const client = new Client({
	intents: INTENTS,
	presence: {
		activities: [{ name: 'over The Akialytes', type: 'WATCHING' }]
	}
});
console.log(LOG_COLORS.INFO(`Bot Environment: ${config.environment}`));

initializeEventHandler(client);
client.login(config.token);
