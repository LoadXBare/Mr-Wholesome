import { User } from 'discord.js';
import prisma from '../../prisma/client';

export const checkWatchlist = async (user: User) => {
	const notes = await prisma.userWatchlist.findMany({
		where: {
			userId: user.id
		}
	});

	if (notes.length === 0)
		return false;

	return true;
};
