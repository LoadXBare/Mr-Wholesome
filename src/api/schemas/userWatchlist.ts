import dayjs from 'dayjs';
import mongoose from 'mongoose';

const userWatchlistSchema = new mongoose.Schema({
	watchedUserID: { type: String, required: true },
	creatorUserID: { type: String, required: true },
	guildID: { type: String, required: true },
	creationDate: { type: String, default: dayjs().toJSON() },
	noteText: { type: String, default: 'None provided.' }
});

export default mongoose.model('user-watchlist', userWatchlistSchema);
