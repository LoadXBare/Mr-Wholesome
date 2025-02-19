import { SnoCommandHandler } from 'commands/fun/sno.js';
import { HelpCommandHandler } from 'commands/information/help.js';
import { XPCommandHandler } from 'commands/utility/xp.js';
import { Events, Interaction } from 'discord.js';
import { ToggleLevelNotifButtonHandler } from '../buttons/ranking/toggle-level-notifs.js';
import { ticketButtonHandler } from '../buttons/tickets/handler.js';
import { CatCommandHandler } from '../commands/fun/cat.js';
import { DogCommandHandler } from '../commands/fun/dog.js';
import { EightBallCommandHandler } from '../commands/fun/eight-ball.js';
import { FoxCommandHandler } from '../commands/fun/fox.js';
import { ReadingCommandHandler } from '../commands/fun/reading.js';
import { WritingCommandHandler } from '../commands/fun/writing.js';
import { PingCommandHandler } from '../commands/information/ping.js';
import { BanCommandHandler, ContextMenuBanCommandHandler } from '../commands/moderation/ban.js';
import { UnbanCommandHandler } from '../commands/moderation/unban.js';
import { UnwarnCommandHandler } from '../commands/moderation/unwarn.js';
import { WarnCommandHandler } from '../commands/moderation/warn.js';
import { WatchlistCommandHandler } from '../commands/moderation/watchlist.js';
import { LeaderboardCommandHandler } from '../commands/ranking/leaderboard.js';
import { RankCommandHandler } from '../commands/ranking/rank.js';
import { BirthdayCommandHandler } from '../commands/utility/birthday.js';
import { TicketPanelCommandHandler } from '../commands/utility/ticket-panel.js';
import { TicketCommandHandler } from '../commands/utility/ticket.js';
import { ViewCommandHandler } from '../commands/utility/view.js';
import { client } from '../index.js';
import { EventHandler } from '../lib/config.js';
import { BanModalHandler } from '../modals/moderation/ban.js';
import { WarningModalHandler } from '../modals/moderation/warn.js';
import { WatchlistModalHandler } from '../modals/moderation/watchlist.js';
import { TicketPanelModalHandler } from '../modals/utility/ticket-panel.js';

class InteractionCreateHandler extends EventHandler {
  interaction: Interaction;

  constructor(interaction: Interaction) {
    super();
    this.interaction = interaction;
  }

  handle() {
    this.handleChatInputCommand();
    this.handleButton();
    this.handleModal();
    this.handleUserContextMenu();
  }

  private async handleChatInputCommand() {
    if (!this.interaction.isChatInputCommand()) return;
    const chatInputInteraction = this.interaction;
    const cmd = chatInputInteraction.commandName;

    // Fun
    if (cmd === 'cat') new CatCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'dog') new DogCommandHandler(chatInputInteraction).handle();
    else if (cmd === '8ball') new EightBallCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'fox') new FoxCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'reading') new ReadingCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'sno') new SnoCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'writing') new WritingCommandHandler(chatInputInteraction).handle();

    // Information
    else if (cmd === 'help') new HelpCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'ping') new PingCommandHandler(chatInputInteraction).handle();

    // Moderation
    else if (cmd === 'ban') new BanCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'unban') new UnbanCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'warn') new WarnCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'unwarn') new UnwarnCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'watchlist') new WatchlistCommandHandler(chatInputInteraction).handle();

    // Ranking
    else if (cmd === 'leaderboard') new LeaderboardCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'rank') new RankCommandHandler(chatInputInteraction).handle();

    // Utility
    else if (cmd === 'birthday') new BirthdayCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'ticket-panel') new TicketPanelCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'ticket') new TicketCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'view') new ViewCommandHandler(chatInputInteraction).handle();
    else if (cmd === 'xp') new XPCommandHandler(chatInputInteraction).handle();

    // Unknown Command / Not Implemented
    else chatInputInteraction.reply({ content: 'This command hasn\'t been implemented yet, come back later (*・ω・)ﾉ', ephemeral: true });
  }

  private async handleButton() {
    if (!this.interaction.isButton()) return;
    const buttonInteraction = this.interaction;
    const customId = buttonInteraction.customId;

    if (customId === 'toggle-level-notif') new ToggleLevelNotifButtonHandler(buttonInteraction).handle();
    if (customId.startsWith('ticket:')) new ticketButtonHandler(buttonInteraction).handle();
  }

  private async handleModal() {
    if (!this.interaction.isModalSubmit()) return;
    const modalInteraction = this.interaction;

    if (modalInteraction.customId.startsWith('ban:')) new BanModalHandler(modalInteraction).handle();
    else if (modalInteraction.customId.startsWith('warn:')) new WarningModalHandler(modalInteraction).handle();
    else if (modalInteraction.customId.startsWith('ticket-panel:')) new TicketPanelModalHandler(modalInteraction).handle();
    else if (modalInteraction.customId.startsWith('watchlist:')) new WatchlistModalHandler(modalInteraction).handle();
  }

  private async handleUserContextMenu() {
    if (!this.interaction.isUserContextMenuCommand()) return;
    const contextMenuInteraction = this.interaction;

    if (this.interaction.commandName === 'Ban User') new ContextMenuBanCommandHandler(contextMenuInteraction).handle();
  }
}

client.on(Events.InteractionCreate, (interaction) => {
  new InteractionCreateHandler(interaction).handle();
});
