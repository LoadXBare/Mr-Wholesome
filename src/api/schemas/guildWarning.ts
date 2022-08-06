import mongoose from 'mongoose';

const guildWarningSchema = new mongoose.Schema({
	guildID: { type: String, required: true },
	warnedUserID: { type: String, required: true },
	creatorUserID: { type: String, required: true },
	warningReason: { type: String, required: true },
	warningDate: { type: String, required: true }
});

export default mongoose.model('guild-warning', guildWarningSchema);
