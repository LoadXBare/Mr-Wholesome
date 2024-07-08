import { client } from '@base';
import ToggleLevelNotifButton from '@buttons/ranking/toggle-level-notifs.js';
import { CatCommandHandler } from '@commands/fun/cat.js';
import { DogCommandHandler } from '@commands/fun/dog.js';
import { EightBallCommandHandler } from '@commands/fun/eight-ball.js';
import { FoxCommandHandler } from '@commands/fun/fox.js';
import { ReadingCommandHandler } from '@commands/fun/reading.js';
import { PingCommandHandler } from '@commands/information/ping.js';
import { BanCommandHandler } from '@commands/moderation/ban.js';
import { UnbanCommandHandler } from '@commands/moderation/unban.js';
import { UnwarnCommandHandler } from '@commands/moderation/unwarn.js';
import { WarnCommandHandler } from '@commands/moderation/warn.js';
import { LeaderboardCommandHandler } from '@commands/ranking/leaderboard.js';
import { RankCommandHandler } from '@commands/ranking/rank.js';
import { BirthdayCommandHandler } from '@commands/utility/birthday.js';
import { ViewCommandHandler } from '@commands/utility/view.js';
import { EventHandler } from '@lib/config.js';
import { BanModalHandler } from '@modals/moderation/ban.js';
import { WarningModalHandler } from '@modals/moderation/warn.js';
import { Events, Interaction } from 'discord.js';

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
    if (cmd === 'cat') new CatCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'dog') new DogCommandHandler(chatInputInteraction).handle();
    else if (cmd === '8ball') new EightBallCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'fox') new FoxCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'reading') new ReadingCommandHandler(chatInputInteraction).handle();

    // Information
    else if (cmd === 'ping') new PingCommandHandler(chatInputInteraction).handle();

    // Moderation
    else if (cmd === 'ban') new BanCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'unban') new UnbanCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'warn') new WarnCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'unwarn') new UnwarnCommandHandler(chatInputInteraction).handle();

    // Ranking
    else if (cmd === 'leaderboard') new LeaderboardCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'rank') new RankCommandHandler(chatInputInteraction).handle();

    // Utility
    else if (cmd === 'birthday') new BirthdayCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'view') new ViewCommandHandler(chatInputInteraction).handle();

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

    if (modalInteraction.customId.startsWith('ban:')) new BanModalHandler(modalInteraction).handle();
    else if (modalInteraction.customId.startsWith('warn:')) new WarningModalHandler(modalInteraction).handle();
  }
}

client.on(Events.InteractionCreate, (interaction) => {
  new InteractionCreateHandler(interaction).handle();
});
