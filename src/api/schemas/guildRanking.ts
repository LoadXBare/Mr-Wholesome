import mongoose from 'mongoose';
import { GuildRanking } from '../../index.js';

const guildRankingSchema = new mongoose.Schema<GuildRanking>({
	guildID: String,
	memberID: String,
	xp: Number,
	xpLevel: Number,
	credits: Number
});

export const guildRanking = mongoose.model<GuildRanking>('guild-ranking', guildRankingSchema);
