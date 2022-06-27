import { mongodb } from '../../api/mongo.js';

export const checkWatchlist = async (userID: string): Promise<boolean> => {
	const notes = await mongodb.userWatchlist.find({
		watchedUserID: userID
	});

	if (notes.length === 0) {
		return false;
	}
	else {
		return true;
	}
};
