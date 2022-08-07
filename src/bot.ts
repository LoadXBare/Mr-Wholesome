import { config } from './private/config.js';
import './private/set-env.js';

import { ActivityType, Client } from 'discord.js';
import { INTENTS } from './config/constants.js';
import { initializeEventHandler } from './lib/event-handler.js';
import { log } from './lib/misc/log.js';

const client = new Client({
	intents: INTENTS,
	presence: {
		activities: [{ name: 'over The Akialytes', type: ActivityType.Watching }]
	}
});
log(`Bot Environment: ${config.environment}`);


initializeEventHandler(client);
client.login(config.token);
