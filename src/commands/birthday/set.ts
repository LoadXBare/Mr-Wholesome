import * as dayjs from 'dayjs';
import { Message, MessageEmbed } from 'discord.js';
import { COLORS, COMMAND_INFO } from '../../config/constants';
import { emojiUrl } from '../../lib/misc/emoji-url';
import prisma from '../../prisma/client';
import { emotes } from '../../private/config';

export const setBirthday = async (message: Message, userInputBirthday: string) => {
	if (userInputBirthday.indexOf('/') === -1) {
		message.reply({ embeds: [COMMAND_INFO.SET_BIRTHDAY] });
		return;
	}

	const birthDate = parseInt(userInputBirthday.slice(0, userInputBirthday.indexOf('/')));
	const birthMonth = parseInt(userInputBirthday.slice(userInputBirthday.indexOf('/') + 1));

	if (isNaN(birthDate) || isNaN(birthMonth)) {
		message.reply({ embeds: [COMMAND_INFO.SET_BIRTHDAY] });
		return;
	}

	const birthday = dayjs()
		.set('date', birthDate)
		.set('month', birthMonth - 1);
	const birthdayFormatted = birthday.format('MMMM DD');

	await prisma.userBirthdays.upsert({
		where: { userId: message.author.id },
		update: {
			userId: message.author.id,
			birthday: birthdayFormatted
		},
		create: {
			userId: message.author.id,
			birthday: birthdayFormatted
		}
	});

	const success = new MessageEmbed()
		.setAuthor({ name: 'Set Birthday', iconURL: emojiUrl(emotes.birthday) })
		.setDescription(`Successfully set your birthday to **${birthdayFormatted}**!`)
		.setFooter({ iconURL: message.member.displayAvatarURL(), text: message.author.tag })
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [success] });
};
