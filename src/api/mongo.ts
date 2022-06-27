import mongoose from 'mongoose';
import { config } from '../private/config.js';
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
		console.log('Successfully connected to MongoDB!');
	}
	catch (e) {
		console.log('An error occurred while connecting to the database!', e);
	}
};

export const mongodb = {
	connectToDatabase,
	guildConfig,
	guildWarning,
	userBirthday,
	userWatchlist
};
