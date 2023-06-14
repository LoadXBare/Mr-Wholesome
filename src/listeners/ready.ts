import { Collection, Events, GuildMember } from 'discord.js';
import client from '../index.js';
import { EventHandler } from '../lib/config.js';
import { Utils } from '../lib/utilities.js';

class ReadyHandler extends EventHandler {
  handle() {
    this.#logClientReady();
    this.#fetchAllGuildMembers();
    this.#deployCommands();
  }

  async #logClientReady() {
    Utils.log(`Logged in as ${client.user?.tag}! [${client.user?.id}]`, true);
  }

  // This is done so all guild members are immediately cached meaning events will be logged from them
  async #fetchAllGuildMembers() {
    const fetchedGuildMembers: Array<Promise<Collection<string, GuildMember>>> = [];

    client.guilds.cache.forEach((guild) => {
      if (guild.available) {
        fetchedGuildMembers.push(guild.members.fetch());
      }
    });

    await Promise.all(fetchedGuildMembers);
  }

  #deployCommands() {
    import('../lib/deploy-commands.js');
  }
}

client.once(Events.ClientReady, async () => {
  new ReadyHandler().handle();
});
