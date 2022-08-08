import { Commands } from '../index.js';
import { stop } from './dev/stop.js';
import { warningReminder } from './dev/warning-reminder.js';
import { birthday } from './fun/birthday.js';
import { cat, dog, fox } from './fun/random-animal.js';
import { help } from './information/help.js';
import { ping } from './information/ping.js';
import { ban } from './moderation/ban.js';
import { warn } from './moderation/warn.js';
import { watchlist } from './moderation/watchlist.js';
import { rolebuttonmenus } from './role-button-menus.js';
import { tcg } from './utility/fetch-trading-card.js';
import { ignoredchannel } from './utility/ignored-channel.js';
import { logchannel } from './utility/log-channel.js';

const commands: Commands = {
	'$stop': stop,
	'$warn': warningReminder,
	'birthday': birthday,
	'cat': cat,
	'dog': dog,
	'fox': fox,
	'help': help,
	'ping': ping,
	'ban': ban,
	'warn': warn,
	'watchlist': watchlist,
	'rolebuttonmenus': rolebuttonmenus,
	'tcg': tcg,
	'ignoredchannel': ignoredchannel,
	'logchannel': logchannel
};

export default commands;
