import { Events, Interaction } from 'discord.js';
import ToggleLevelNotifButton from '../buttons/ranking/toggle-level-notifs.js';
import CatCommand from '../commands/fun/cat.js';
import DogCommand from '../commands/fun/dog.js';
import EightBallCommand from '../commands/fun/eight-ball.js';
import FoxCommand from '../commands/fun/fox.js';
import ReadingCommand from '../commands/fun/reading.js';
import PingCommand from '../commands/information/ping.js';
import WarnCommand from '../commands/moderation/warn/warn.js';
import LeaderboardCommand from '../commands/ranking/leaderboard.js';
import RankCommand from '../commands/ranking/rank.js';
import BirthdayCommand from '../commands/utility/birthday.js';
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
    this.#handleButton();
  }

  async #handleChatInputCommand() {
    if (!this.interaction.isChatInputCommand()) return;
    const chatInputInteraction = this.interaction;
    const cmd = chatInputInteraction.commandName;

    // Fun
    if (cmd === 'cat') new CatCommand(chatInputInteraction).handle();
    else if (cmd === 'dog') new DogCommand(chatInputInteraction).handle();
    else if (cmd === '8ball') new EightBallCommand(chatInputInteraction).handle();
    else if (cmd === 'fox') new FoxCommand(chatInputInteraction).handle();
    else if (cmd === 'reading') new ReadingCommand(chatInputInteraction).handle();

    // Information
    else if (cmd === 'ping') new PingCommand(chatInputInteraction).handle();

    // Moderation
    else if (cmd === 'warn') new WarnCommand(chatInputInteraction).handle();

    // Ranking
    else if (cmd === 'leaderboard') new LeaderboardCommand(chatInputInteraction).handle();
    else if (cmd === 'rank') new RankCommand(chatInputInteraction).handle();

    // Utility
    else if (cmd === 'birthday') new BirthdayCommand(chatInputInteraction).handle();

    // Unknown Command / Not Implemented
    else chatInputInteraction.reply({ content: 'This command hasn\'t been implemented yet, come back later (*・ω・)ﾉ', ephemeral: true });
  }

  async #handleButton() {
    if (!this.interaction.isButton()) return;
    const buttonInteraction = this.interaction;
    const customId = buttonInteraction.customId;

    if (customId === 'toggle-level-notif') new ToggleLevelNotifButton(buttonInteraction).handle();
  }
}

client.on(Events.InteractionCreate, (interaction) => {
  new InteractionCreateHandler(interaction).handle();
});
