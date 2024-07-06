import { client } from '@base';
import ToggleLevelNotifButton from '@buttons/ranking/toggle-level-notifs.js';
import CatCommand from '@commands/fun/cat.js';
import DogCommand from '@commands/fun/dog.js';
import EightBallCommand from '@commands/fun/eight-ball.js';
import FoxCommand from '@commands/fun/fox.js';
import ReadingCommand from '@commands/fun/reading.js';
import PingCommand from '@commands/information/ping.js';
import { BanCommandHandler } from '@commands/moderation/ban.js';
import { UnbanCommandHandler } from '@commands/moderation/unban.js';
import { UnwarnCommandHandler } from '@commands/moderation/unwarn.js';
import WarnCommandHandler from '@commands/moderation/warn.js';
import LeaderboardCommand from '@commands/ranking/leaderboard.js';
import RankCommand from '@commands/ranking/rank.js';
import BirthdayCommand from '@commands/utility/birthday.js';
import ViewCommandHandler from '@commands/utility/view.js';
import { EventHandler } from '@lib/config.js';
import { WarningModalHandler } from '@modals/moderation/warn.js';
import { Events, Interaction } from 'discord.js';
import BanModalHandler from 'modals/moderation/ban.js';

class InteractionCreateHandler extends EventHandler {
  interaction: Interaction;

  constructor(interaction: Interaction) {
    super();
    this.interaction = interaction;
  }

  handle() {
    this.#handleChatInputCommand();
    this.#handleButton();
    this.#handleModal();
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
    else if (cmd === 'ban') new BanCommandHandler(chatInputInteraction);
    else if (cmd === 'unban') new UnbanCommandHandler(chatInputInteraction);
    else if (cmd === 'warn') new WarnCommandHandler(chatInputInteraction);
    else if (cmd === 'unwarn') new UnwarnCommandHandler(chatInputInteraction);

    // Ranking
    else if (cmd === 'leaderboard') new LeaderboardCommand(chatInputInteraction).handle();
    else if (cmd === 'rank') new RankCommand(chatInputInteraction).handle();

    // Utility
    else if (cmd === 'birthday') new BirthdayCommand(chatInputInteraction).handle();
    else if (cmd === 'view') new ViewCommandHandler(chatInputInteraction);

    // Unknown Command / Not Implemented
    else chatInputInteraction.reply({ content: 'This command hasn\'t been implemented yet, come back later (*・ω・)ﾉ', ephemeral: true });
  }

  async #handleButton() {
    if (!this.interaction.isButton()) return;
    const buttonInteraction = this.interaction;
    const customId = buttonInteraction.customId;

    if (customId === 'toggle-level-notif') new ToggleLevelNotifButton(buttonInteraction).handle();
  }

  async #handleModal() {
    if (!this.interaction.isModalSubmit()) return;
    const modalInteraction = this.interaction;

    if (modalInteraction.customId.startsWith('ban:')) new BanModalHandler(modalInteraction);
    else if (modalInteraction.customId.startsWith('warn:')) new WarningModalHandler(modalInteraction);
  }
}

client.on(Events.InteractionCreate, (interaction) => {
  new InteractionCreateHandler(interaction).handle();
});
// TODO: Convert all commands to non-default exports
// TODO: Generic command handler that serves as an extension for all command classes -- e.g. global guildID because commands only work in guilds, etc etc