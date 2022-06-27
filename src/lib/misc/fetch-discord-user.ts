import { Client, User } from 'discord.js';

export const fetchDiscordUser = async (client: Client, userID: string): Promise<User> => {
	let user: User;

	try {
		user = await client.users.fetch(userID);
	}
	catch {
		user = null;
	}

	return user;
};
