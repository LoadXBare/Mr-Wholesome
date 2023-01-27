import { UserCookies } from '..';
import { mongodb } from './mongo.js';

export const fetchUserCookies = async (userID: string): Promise<UserCookies> => {
	let userCookies = await mongodb.userCookies.findOne({
		userID: userID
	});

	if (userCookies === null) {
		const newUserCookiesObject: UserCookies = {
			cookiesGiven: 0,
			cookiesReceived: 0,
			userID: userID
		};

		userCookies = await mongodb.userCookies.create(newUserCookiesObject);
	}

	const userCookiesFormatted: UserCookies = {
		cookiesGiven: userCookies.cookiesGiven,
		cookiesReceived: userCookies.cookiesReceived,
		userID: userCookies.userID
	};

	return userCookiesFormatted;
};

export const updateUserCookies = async (data: UserCookies): Promise<void> => {
	await mongodb.userCookies.updateOne({
		userID: data.userID
	}, data);
};
