import { Client } from 'discord.js';

export const ready = async (client: Client) => {
	console.log(`Successfully logged in as ${client.user.tag}!`);
};
