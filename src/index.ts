import { ActivityType, Client } from 'discord.js';
import * as dotenv from 'dotenv';
import { Intents } from './lib/config.js';
dotenv.config();

export const client = new Client({
	intents: Intents,
	presence: {
		activities: [{
			name: 'over The Akialytes',
			type: ActivityType.Watching
		}]
	},
	allowedMentions: {
		repliedUser: false,
		roles: []
	}
});

// Initalise event listeners
import('./listeners/index.js');

client.login(process.env.TOKEN)
	.catch((e) => console.error('An error occurred while logging in!', e));
