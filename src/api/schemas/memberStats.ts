import mongoose from 'mongoose';
import { MemberStats } from '../../index.js';

const memberStatsSchema = new mongoose.Schema<MemberStats>({
	guildID: String,
	memberID: String,
	messageCount: Number,
	messageCountByHour: Object
});

export const memberStats = mongoose.model<MemberStats>('member-stat', memberStatsSchema);
