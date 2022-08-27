import Keyv from 'keyv';
import { Cache } from '../index.js';

const keyv = new Keyv();

const initialise = async (): Promise<void> => {
	await keyv.set('wsPingHistory', []);
};

const fetch = async <T extends keyof Cache>(key: T): Promise<Cache[T]> => {
	const value = await keyv.get(key) as Cache[T];

	return value;
};

const update = async <K extends keyof Cache>(key: K, value: Cache[K]): Promise<void> => {
	await keyv.set(key, value);
};

export const cache = {
	initialise,
	fetch,
	update
};
