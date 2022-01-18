const { Client, Intents } = require('discord.js');
const { token } = require('../private/config.js');
const eventHandler = require('./eventHandler.js');
const events = [
	'guildBanAdd',
	'guildBanRemove',
	'guildMemberAdd',
	'guildMemberRemove',
	'guildMemberUpdate',
	'messageCreate',
	'messageDelete',
	'messageUpdate',
	'ready',
	'roleCreate',
	'roleDelete',
	'roleUpdate'
];
const intents = new Intents([
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_BANS
]);


const client = new Client({ intents: intents });

events.forEach((event) => {
	client.on(event, (...args) => eventHandler.handle(event, args));
	console.log(`Successfully registered event: ${event}`);
});

client.login(token);

module.exports = client;