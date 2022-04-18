import { Client, Message } from 'discord.js';
import * as events from '../events/index.js';

export const initializeEventHandler = async (client: Client) => {
	/*
		I know there's a better way to do this, but for the sake
		of simplicity with TypeScript's typing system, this is
		how it'll stay for now.
	*/

	client.on('guildBanAdd', (b) => events.guildBanAdd(b));
	client.on('guildBanRemove', (b) => events.guildBanRemove(b));
	client.on('guildMemberAdd', (m) => events.guildMemberAdd(m));
	client.on('guildMemberRemove', (m) => events.guildMemberRemove(m));
	client.on('guildMemberUpdate', (oM, nM) => events.guildMemberUpdate(oM, nM));
	client.on('interactionCreate', (i) => events.interactionCreate(i));
	client.on('messageCreate', (m) => events.messageCreate(m));
	client.on('messageDelete', (m) => events.messageDelete(m));
	client.on('messageUpdate', (oM, nM) => events.messageUpdate(oM as Message, nM as Message));
	client.on('ready', (c) => events.ready(c));
	client.on('roleCreate', (r) => events.roleCreate(r));
	client.on('roleDelete', (r) => events.roleDelete(r));
	client.on('roleUpdate', (oR, nR) => events.roleUpdate(oR, nR));
	client.on('rateLimit', (d) => console.log('The client is being rate-limited!', d));
};
