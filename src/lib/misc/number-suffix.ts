import { Suffixes } from '../../index.js';

export const numSuffix = (num: number): string => {
	const numStr = num.toString();

	const suffixList: Suffixes = {
		1: 'st',
		2: 'nd',
		3: 'rd'
	};

	if (num >= 10 && num <= 20) {
		return 'th';
	}

	const lastNum = parseInt(numStr.charAt(numStr.length - 1));

	if (lastNum > 3) {
		return 'th';
	}
	else {
		return suffixList[lastNum];
	}
};
