import { ChatInputCommandInteraction, Events, Interaction } from 'discord.js';
import CatCommand from '../commands/fun/cat.js';
import DogCommand from '../commands/fun/dog.js';
import EightBallCommand from '../commands/fun/eight-ball.js';
import FoxCommand from '../commands/fun/fox.js';
import PingCommand from '../commands/information/ping.js';
import BirthdayCommand from '../commands/utility/birthday.js';
import SettingsCommand from '../commands/utility/settings.js';
import client from '../index.js';
import { EventHandler } from '../lib/config.js';

class InteractionCreateHandler extends EventHandler {
  interaction: Interaction;

  constructor(interaction: Interaction) {
    super();
    this.interaction = interaction;
  }

  handle() {
    this.#handleChatInputCommand();
  }

  async #handleChatInputCommand() {
    if (!this.interaction.isChatInputCommand()) return;
    const chatInputInteraction = this.interaction as ChatInputCommandInteraction;
    const cmd = chatInputInteraction.commandName;

    // Fun
    if (cmd === 'cat') new CatCommand(chatInputInteraction).handle();
    else if (cmd === 'dog') new DogCommand(chatInputInteraction).handle();
    else if (cmd === '8ball') new EightBallCommand(chatInputInteraction).handle();
    else if (cmd === 'fox') new FoxCommand(chatInputInteraction).handle();

    // Information
    else if (cmd === 'ping') new PingCommand(chatInputInteraction).handle();

    // Moderation


    // Ranking


    // Utility
    else if (cmd === 'birthday') new BirthdayCommand(chatInputInteraction).handle();
    else if (cmd === 'settings') new SettingsCommand(chatInputInteraction).handle();

    // Unknown Command / Not Implemented
    else chatInputInteraction.reply({ content: 'This command hasn\'t been implemented yet, come back later (*・ω・)ﾉ', ephemeral: true });
  }
}

client.on(Events.InteractionCreate, (interaction) => {
  new InteractionCreateHandler(interaction).handle();
});
