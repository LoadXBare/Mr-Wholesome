import mongoose from 'mongoose';
import { UserCookies } from '../..';

const userCookiesSchema = new mongoose.Schema<UserCookies>({
	userID: String,
	cookiesGiven: Number,
	cookiesReceived: Number
});

export const userCookies = mongoose.model<UserCookies>('user-cookie', userCookiesSchema);
