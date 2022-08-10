import mongoose from 'mongoose';

const guildTicketSchema = new mongoose.Schema({
	creatorID: { type: String, required: true },
	ticketOpen: { type: Boolean, require: true }
});

export default mongoose.model('guild-ticket', guildTicketSchema);
