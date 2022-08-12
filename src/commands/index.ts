import { Commands } from '../index.js';
import { stop } from './dev/stop.js';
import { warningReminder } from './dev/warning-reminder.js';
import { birthday } from './fun/birthday.js';
import { cat } from './fun/cat.js';
import { dog } from './fun/dog.js';
import { eightBall } from './fun/eight-ball.js';
import { fox } from './fun/fox.js';
import { help } from './information/help.js';
import { ping } from './information/ping.js';
import { ban } from './moderation/ban.js';
import { warn } from './moderation/warn.js';
import { watchlist } from './moderation/watchlist.js';
import { roleButtonMenus } from './role-button-menus.js';
import { tradingCardGame } from './utility/fetch-trading-card.js';
import { ignoredChannel } from './utility/ignored-channel.js';
import { logChannel } from './utility/log-channel.js';
import { ticketPanel } from './utility/ticket-panel.js';

export const commands: Commands = {
	'$stop': stop,
	'$warn': warningReminder,
	'birthday': birthday,
	'8ball': eightBall,
	'cat': cat,
	'dog': dog,
	'fox': fox,
	'help': help,
	'ping': ping,
	'ban': ban,
	'warn': warn,
	'watchlist': watchlist,
	'rolebuttonmenus': roleButtonMenus,
	'tcg': tradingCardGame,
	'ignoredchannel': ignoredChannel,
	'logchannel': logChannel,
	'ticketpanel': ticketPanel
};
