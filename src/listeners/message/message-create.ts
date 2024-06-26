import { Events, Message } from 'discord.js';
import client from '../../index.js';
import { ChannelIDs, Emotes, EventHandler, UserIDs } from '../../lib/config.js';
import { channelIgnoresEvents } from '../../lib/database-utilities.js';
import RankingHandler from '../../lib/ranking-handler.js';
import { styleLog } from '../../lib/utilities.js';

class MessageCreateHandler extends EventHandler {
  message: Message;

  constructor(message: Message) {
    super();
    this.message = message;
  }

  async handle() {
    const { guildId, channelId, author } = this.message;
    const channelHasEventsIgnored = await channelIgnoresEvents(guildId, channelId);
    if (author.bot || channelHasEventsIgnored) return;

    this.#autoCrosspost();
    this.#bonkAkiaForSorry();
    this.#painAuChocolat();
    this.#reactWithArson();
    this.#useSlashCommands();
    this.#handleRanking();
  }

  // Automatically crosspost any message sent in Announcement channels
  async #autoCrosspost() {
    if (!this.message.crosspostable) return;

    await this.message.crosspost()
      .then(() => styleLog('Crossposted message!', true, 'message-create.js'))
      .catch((e) => styleLog('Error occurred while crossposting message!', false, 'message-create.js', e));
  }

  // React with :akiaBonque: emoji and say "NO SORRY" if message contains "sorry" and sent by Akia
  async #bonkAkiaForSorry() {
    const messageContainsSorry = this.message.content.search(/[s]+[o]+[rw]+[y]+/mi) !== -1;
    const authorIsAkia = this.message.author.id === UserIDs.Akialyne;
    if (!messageContainsSorry || !authorIsAkia) return;

    await this.message.react(Emotes.Bonque)
      .then(() => styleLog('Reacted with Bonque!', true, 'message-create.js'))
      .catch((e) => styleLog('Error occurred while reacting to message!', false, 'message-create.js', e));
    await this.message.reply(`NO SORRY ${Emotes.Bonque}`)
      .then(() => styleLog('Replied with "NO SORRY"!', true, 'message-create.js'))
      .catch((e) => styleLog('Error occurred while replying to message!', false, 'message-create.js', e));
  }

  // Say "au chocolat?" if the message ends with "pain" and is sent in #🤡-memes-🤡
  async #painAuChocolat() {
    const messageEndsWithPain = this.message.content.search(/\bpain\W{0,}$/i) !== -1;
    const channelIsMemes = this.message.channelId === ChannelIDs.Memes;
    if (!messageEndsWithPain || !channelIsMemes) return;

    await this.message.reply('au chocolat?')
      .then(() => styleLog('Replied with "au chocolat?"!', true, 'message-create.js'))
      .catch((e) => styleLog('Error occurred while replying to a message!', false, 'message-create.js', e));
  }

  // React with the :arson: emoji if the message contains "arson"
  async #reactWithArson() {
    const messageContainsArson = this.message.content.search(/(?<!\S)[a]+[r]+[s]+[o]+[n]+/mi) !== -1;
    if (!messageContainsArson) return;

    await this.message.react(Emotes.Arson)
      .then(() => styleLog('Reacted with Arson!', true, 'message-create.js'))
      .catch((e) => styleLog('Error occurred while reacting to message!', false, 'message-create.js', e));
  }

  // Say "Hey, I use slash commands now!" if the message is an old command
  async #useSlashCommands() {
    const oldCommands = ['!birthday', '!8ball', '!cookie', '!cat', '!dog', '!fox', '!reading', '!help', '!mystats', '!ping', '!ban', '!warn', '!watchlist', '!top', '!rank', '!ticketpanel'];
    const messageIsOldCommand = oldCommands.includes(this.message.content.split(' ')[0]);
    if (!messageIsOldCommand) return;

    await this.message.reply('Hey, I use slash commands now!')
      .then(() => styleLog('Replied with "Please use slash commands instead!"!', true, 'message-create.js'))
      .catch((e) => styleLog('Error occurred while replying to message!', false, 'message-create.js', e));
  }

  // Handle everything related to ranking (it is lengthy so I contained it within its own class)
  async #handleRanking() {
    new RankingHandler(this.message).handle();
  }
}

client.on(Events.MessageCreate, (message) => {
  new MessageCreateHandler(message).handle();
});
