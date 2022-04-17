import { userMention } from '@discordjs/builders';
import * as dayjs from 'dayjs';
import { Client, Guild, TextChannel } from 'discord.js';
import prisma from '../prisma/client';
import { theAkialytes } from '../private/config';

const checkRoles = async (guild: Guild) => {
	const members = await guild.members.fetch();

	if (dayjs().format('MMMM DD') !== 'September 03') {
		const member = await guild.members.fetch(theAkialytes.ownerId);
		member.roles.add(theAkialytes.roles['Birthday Role']);
	}

	for (let i = 0; i < members.size; i++) {
		const member = members.at(i);

		if (member.id === theAkialytes.ownerId)
			return;

		const memberRoles = member.roles.cache;

		if (memberRoles.has(theAkialytes.roles['Birthday Role'])) {
			const userBirthday = await prisma.userBirthdays.findUnique({
				where: { userId: member.id }
			});

			if (userBirthday.birthday !== dayjs().format('MMMM DD')) {
				member.roles.remove(theAkialytes.roles['Birthday Role']);
			}
		}
	}
};

const postBirthdayMessage = async (date: string, guild: Guild, channel: TextChannel) => {
	const birthdaysToday = await prisma.userBirthdays.findMany({
		where: { birthday: { equals: date } }
	});
	let birthdayMessage = '';

	if (birthdaysToday.length === 0) {
		return;
	} else if (birthdaysToday.length === 1) {
		const userId = birthdaysToday.at(0).userId;
		const member = await guild.members.fetch(userId);
		if (userId === theAkialytes.ownerId) {
			birthdayMessage = `Today is *definitely not* ${userMention(userId)}'s birthday, please continue your day as normal! ${theAkialytes.emotes.akiaLaugh}`;
			member.roles.remove(theAkialytes.roles['Birthday Role']);
		} else {
			birthdayMessage = `Today is ${userMention(userId)}'s birthday!\nLet's wish them a happy birthday 🥳`;
			member.roles.add(theAkialytes.roles['Birthday Role']);
		}
	} else {
		birthdayMessage = 'We have more than 1 birthday today!\nLet\'s wish a happy birthday to ';
		for (let i = 0; i < birthdaysToday.length; i++) {
			const userId = birthdaysToday.at(i).userId;
			const member = await guild.members.fetch(userId);

			member.roles.add(theAkialytes.roles['Birthday Role']);

			birthdayMessage = birthdayMessage.concat(`${userMention(userId)}`);
			if (i === birthdaysToday.length - 2)
				birthdayMessage = birthdayMessage.concat(' and ');
			else if (i < birthdaysToday.length - 2)
				birthdayMessage = birthdayMessage.concat(', ');
		}
		birthdayMessage = birthdayMessage.concat(' 🥳');
	}

	channel.send(birthdayMessage);
};

const birthdayScheduler = async (client: Client) => {
	const theAkialytesGuild = await client.guilds.fetch(theAkialytes.guildId);
	let lastRunDate = 'MMMM DD';

	setInterval(async () => {
		const currentDate = dayjs().format('MMMM DD');

		checkRoles(theAkialytesGuild);
		if (currentDate === lastRunDate)
			return;

		const birthdayChannel = await client.channels.fetch(theAkialytes.birthdayChannelId) as TextChannel;
		lastRunDate = currentDate;

		postBirthdayMessage(currentDate, theAkialytesGuild, birthdayChannel);
	}, 5 * 60 * 1000);
};

export const startScheduler = (client: Client) => {
	birthdayScheduler(client);
};
