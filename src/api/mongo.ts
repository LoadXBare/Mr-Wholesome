import mongoose from 'mongoose';
import { LOG_COLORS } from '../config/constants.js';
import { config } from '../private/config.js';
import guildBan from './schemas/guildBan.js';
import guildConfig from './schemas/guildConfig.js';
import guildWarning from './schemas/guildWarning.js';
import userBirthday from './schemas/userBirthday.js';
import userWatchlist from './schemas/userWatchlist.js';

const connectToDatabase = async (): Promise<void> => {
	try {
		await mongoose.connect(config.databaseInfo.url, {
			authSource: 'admin',
			user: config.databaseInfo.user,
			pass: config.databaseInfo.pass
		});
		console.log(LOG_COLORS.SUCCESS('Successfully connected to MongoDB!'));
	}
	catch (e) {
		console.log(LOG_COLORS.ERROR('An error occurred while connecting to the database!'), e);
	}
};

export const mongodb = {
	connectToDatabase,
	guildBan,
	guildConfig,
	guildWarning,
	userBirthday,
	userWatchlist
};
