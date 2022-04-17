import { inlineCode } from '@discordjs/builders';
import * as dayjs from 'dayjs';
import { Message, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants';
import { emojiUrl } from '../../lib/misc/emoji-url';
import prisma from '../../prisma/client';
import { emotes } from '../../private/config';

export const upcomingBirthdays = async (message: Message) => {
	const birthdays = await prisma.userBirthdays.findMany({
		orderBy: {
			birthday: 'desc'
		}
	});

	let upcoming = '';
	let upcomingCount = 0;
	for (let i = 1; i < 15; i++) {
		const dateToCheck = dayjs().add(i, 'day').format('MMMM DD');
		for (let j = 0; j < birthdays.length; j++) {
			const birthday = birthdays.at(j);
			if (birthday.birthday === dateToCheck) {
				const member = await message.guild.members.fetch(birthday.userId);
				upcoming = upcoming.concat(`• ${inlineCode(dateToCheck)} - ${member.displayName}\n`);
				upcomingCount += 1;
			}
		}
	}

	let upcomingText = '';
	if (upcomingCount === 0)
		upcomingText = 'There are no birthdays within the next 2 weeks!';
	else
		upcomingText = `There are ${upcomingCount} birthdays upcoming within the next 2 weeks!\n\n${upcoming}`;


	const upcomingBirthdayList = new MessageEmbed()
		.setAuthor({ name: 'Upcoming Birthdays', iconURL: emojiUrl(emotes.birthday) })
		.setDescription(upcomingText)
		.setColor(COLORS.COMMAND);
	message.reply({ embeds: [upcomingBirthdayList] });
};
