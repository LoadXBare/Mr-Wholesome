import dayjs from 'dayjs';

export const log = (...content: Array<unknown>): void => {
	console.log(`[${dayjs().format('DD/MM/YYYY HH:mm:ss.SSS')}]`, ...content);
};
