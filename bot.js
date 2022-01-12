const { Client, Intents } = require('discord.js');
const { handleEvent } = require('./events/handleEvent.js');
const { token } = require('./private/config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', async () => { handleEvent('ready', { client: client }); });
client.on('messageCreate', async (msg) => { handleEvent('messageCreate', { client: client, msg: msg }); });

client.login(token);

/* TODO
* Ticket system
* Reaction roles using buttons
* Action logging (deleted messages, edited messages, nickname changes, etc.)
* User birthdays
* Minigames?
*/