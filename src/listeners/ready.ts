import { Collection, Events, GuildMember } from 'discord.js';
import { client } from '../index.js';
import { EventHandler } from '../lib/config.js';
import Scheduler from '../lib/scheduler.js';
import { styleLog } from '../lib/utilities.js';

class ReadyHandler extends EventHandler {
  handle() {
    this.#logClientReady();
    this.#fetchAllGuildMembers();
    this.#deployCommands();
  }

  #logClientReady() {
    styleLog(`Logged in as ${client.user?.tag}! [${client.user?.id}]`, true, 'ready.js');
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

    this.#startScheduler();
  }

  #deployCommands() {
    import('../lib/deploy-commands.js');
  }

  #startScheduler() {
    new Scheduler().start();
  }
}

client.once(Events.ClientReady, async () => {
  new ReadyHandler().handle();
});
