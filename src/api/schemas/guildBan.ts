import mongoose from 'mongoose';

const guildBanSchema = new mongoose.Schema({
	guildID: { type: String, required: true },
	bannedUserID: { type: String, required: true },
	creatorUserID: { type: String, required: true },
	banReason: { type: String, required: true },
	banDate: { type: String, required: true },
	unbanned: { type: Boolean, required: true }
});

export default mongoose.model('guild-ban', guildBanSchema);
