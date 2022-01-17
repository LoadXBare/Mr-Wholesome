const { Client, Intents } = require('discord.js');
const { token } = require('../private/config.js');
const eventHandler = require('./eventHandler.js');

const intents = new Intents([Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]);

const client = new Client({ intents: intents });
/*
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
client.on('guildMemberUpdate', (oM, nM) => eventHandler.handle('guildMemberUpdate', { oldMember: oM, newMember: nM }));
client.on('guildMemberAdd', (m) => eventHandler.handle('guildMemberAdd', { member: m }));
client.on('guildMemberRemove', (m) => eventHandler.handle('guildMemberRemove', { member: m }));
client.login(token);

module.exports = client;