import { Events } from 'discord.js';
import client from '../index.js';
import { Utils } from '../lib/utilities.js';

client.once(Events.ClientReady, () => {
  Utils.log(`Logged in as ${client.user?.tag}! [${client.user?.id}]`, true);
});
