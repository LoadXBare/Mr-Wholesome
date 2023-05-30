import { ChatInputCommandInteraction, Events, Interaction } from 'discord.js';
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

    switch (chatInputInteraction.commandName) {
      case 'settings':
        new SettingsCommand(chatInputInteraction).handle();
        break;

      default:
        chatInputInteraction.reply({ content: 'This command hasn\'t been implemented yet, come back later (*・ω・)ﾉ', ephemeral: true });
        break;
    }
  }
}

client.on(Events.InteractionCreate, (interaction) => {
  new InteractionCreateHandler(interaction).handle();
});
