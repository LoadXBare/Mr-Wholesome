const { Client, Intents } = require('discord.js');
const { token } = require('../private/config.json');
const eventHandler = require('./eventHandler.js');

const intents = new Intents([Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]);

const client = new Client({ intents: intents });
/*
guildMemberAdd
guildMemberRemove
guildMemberUpdate
guildBanAdd
guildBanRemove
roleCreate
roleDelete
roleUpdate
*/
client.on('ready', () => eventHandler.handle('ready', { client: client }));
client.on('messageCreate', (m) => eventHandler.handle('messageCreate', { msg: m }));
client.on('messageDelete', (m) => eventHandler.handle('messageDelete', { msg: m }));
client.on('messageUpdate', (mB, mA) => eventHandler.handle('messageUpdate', { msgBefore: mB, msgAfter: mA }));
client.login(token);

module.exports = client;