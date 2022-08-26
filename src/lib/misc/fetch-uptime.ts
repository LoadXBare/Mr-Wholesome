import dayjs from 'dayjs';
import { client } from '../../bot.js';
import { Uptime } from '../../index.js';

export const fetchUptime = (): Uptime => {
	const currentTime = dayjs().utc();
	const clientReadyTime = dayjs(client.readyTimestamp);
	const daysUptime = currentTime.diff(clientReadyTime, 'day');
	const hoursUptime = currentTime.diff(clientReadyTime, 'hour') % 24;
	const minutesUptime = currentTime.diff(clientReadyTime, 'minute') % 60;
	const secondsUptime = currentTime.diff(clientReadyTime, 'second') % 60;

	const uptime: Uptime = {
		days: daysUptime,
		hours: hoursUptime,
		minutes: minutesUptime,
		seconds: secondsUptime
	};

	return uptime;
};
