import mongoose from 'mongoose';

const guildTicketPanelSchema = new mongoose.Schema({
	guildID: { type: String, required: true },
	ticketCategoryID: { type: String, required: true },
	panelEmbedJSON: { type: String, required: true },
	ticketEmbedJSON: { type: String, required: true },
	panelName: { type: String, required: true }
});

export default mongoose.model('guild-ticket-panel', guildTicketPanelSchema);
