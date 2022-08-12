import mongoose from 'mongoose';

const userWatchlistSchema = new mongoose.Schema({
	watchedUserID: { type: String, required: true },
	creatorUserID: { type: String, required: true },
	guildID: { type: String, required: true },
	creationDate: { type: String, required: true },
	noteText: { type: String, default: 'None provided.' }
});

export const userWatchlist = mongoose.model('user-watchlist', userWatchlistSchema);
