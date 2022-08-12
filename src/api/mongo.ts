import mongoose from 'mongoose';
import { log } from '../lib/misc/log.js';
import { config } from '../private/config.js';
import { guildBan } from './schemas/guildBan.js';
import { guildConfig } from './schemas/guildConfig.js';
import { guildTicket } from './schemas/guildTicket.js';
import { guildTicketPanel } from './schemas/guildTicketPanel.js';
import { guildWarning } from './schemas/guildWarning.js';
import { userBirthday } from './schemas/userBirthday.js';
import { userWatchlist } from './schemas/userWatchlist.js';

const connectToDatabase = async (): Promise<void> => {
	try {
		await mongoose.connect(config.databaseInfo.url, {
			authSource: 'admin',
			user: config.databaseInfo.user,
			pass: config.databaseInfo.pass
		});
		log('Successfully connected to MongoDB!');
	}
	catch (e) {
		log('An error occurred while connecting to the database!', e);
	}
};

export const mongodb = {
	connectToDatabase,
	guildBan,
	guildConfig,
	guildTicket,
	guildTicketPanel,
	guildWarning,
	userBirthday,
	userWatchlist
};
