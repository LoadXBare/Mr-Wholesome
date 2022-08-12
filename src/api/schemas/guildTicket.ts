import mongoose from 'mongoose';

const guildTicketSchema = new mongoose.Schema({
	creatorID: { type: String, required: true },
	ticketOpen: { type: Boolean, require: true }
});

export const guildTicket = mongoose.model('guild-ticket', guildTicketSchema);
