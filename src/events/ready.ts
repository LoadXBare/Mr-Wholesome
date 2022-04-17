import { Client } from 'discord.js';
import { startScheduler } from '../lib/scheduler';

export const ready = async (client: Client) => {
	startScheduler(client);
	console.log(`Successfully logged in as ${client.user.tag}!`);
};
