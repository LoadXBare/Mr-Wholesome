import mongoose from 'mongoose';

const userBirthdaySchema = new mongoose.Schema({
	userID: { type: String, required: true },
	birthday: { type: String, required: true }
});

export default mongoose.model('user-birthday', userBirthdaySchema);
