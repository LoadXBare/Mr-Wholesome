import * as dayjs from 'dayjs';
import * as relativeTimePlugin from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTimePlugin);

export const fromNow = (date: Date) => {
	const timeFromNow = dayjs()
		.set('millisecond', date.getMilliseconds())
		.set('second', date.getSeconds())
		.set('minute', date.getMinutes())
		.set('hour', date.getHours())
		.set('date', date.getDate())
		.set('month', date.getMonth())
		.set('year', date.getFullYear());

	return timeFromNow.fromNow();
};

export const relativeTime = {
	fromNow
};
