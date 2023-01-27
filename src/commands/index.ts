import { Commands } from '../index.js';
import { stop } from './dev/stop.js';
import { warningReminder } from './dev/warning-reminder.js';
import { birthday } from './fun/birthday.js';
import { cat } from './fun/cat.js';
import { cookie } from './fun/cookie.js';
import { dog } from './fun/dog.js';
import { eightBall } from './fun/eight-ball.js';
import { fox } from './fun/fox.js';
import { reading } from './fun/reading.js';
import { help } from './information/help.js';
import { memberStats } from './information/member-stats.js';
import { ping } from './information/ping.js';
import { ban } from './moderation/ban.js';
import { warn } from './moderation/warn.js';
import { watchlist } from './moderation/watchlist.js';
import { leaderboard } from './ranking/leaderboard.js';
import { checkRank } from './ranking/rank.js';
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
	'cookie': cookie,
	'cat': cat,
	'dog': dog,
	'fox': fox,
	'reading': reading,
	'help': help,
	'mystats': memberStats,
	'ping': ping,
	'ban': ban,
	'warn': warn,
	'watchlist': watchlist,
	'top': leaderboard,
	'rank': checkRank,
	'rolebuttonmenus': roleButtonMenus,
	'tcg': tradingCardGame,
	'ignoredchannel': ignoredChannel,
	'logchannel': logChannel,
	'ticketpanel': ticketPanel
};
