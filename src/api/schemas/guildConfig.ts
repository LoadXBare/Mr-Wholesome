import mongoose from 'mongoose';

const guildConfigSchema = new mongoose.Schema({
	guildID: { type: String, required: true },
	logChannelID: { type: String, default: '' },
	ignoredChannelIDs: { type: [String], default: [] },
	guildRankingIgnoredChannelIDs: { type: [String], default: [] }
});

export const guildConfig = mongoose.model('guild-config', guildConfigSchema);
