import { ActivityType, Client } from 'discord.js';
import { Intents } from './lib/config.js';

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

client.login('MTA2ODQ2MjgyNjY5NzUzMTQ0Mw.GA84dN.W3qqNRRFQbExLUc05HkClJAp6AkcJ6wNqas0xk')
	.catch((e) => console.error('An error occurred while logging in!', e));
