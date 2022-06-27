import mongoose from 'mongoose';

const guildConfigSchema = new mongoose.Schema({
	guildID: { type: String, required: true },
	logChannelID: { type: String, default: null },
	ignoredChannelIDs: { type: [String], default: null }
});

export default mongoose.model('guild-config', guildConfigSchema);
