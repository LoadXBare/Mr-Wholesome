import dayjs from 'dayjs';
import { EmbedBuilder, inlineCode, Message } from 'discord.js';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { fetchDiscordUser } from '../../lib/misc/fetch-discord-user.js';
import { numSuffix } from '../../lib/misc/number-suffix.js';
import { sendError } from '../../lib/misc/send-error.js';

const setBirthday = async (message: Message, birthDate: string): Promise<void> => {
	const isValidBirthday = birthDate.match(/(?<=^)\d{2}\/\d{2}(?=$)/);

	if (isValidBirthday === null) {
		sendError(message, `${inlineCode(birthDate)} is not a valid birthday!\
		\n*Format: ${inlineCode('DD/MM')}, Example: ${inlineCode('24/09')}*`);
		return;
	}

	const birthday = dayjs(birthDate, 'DD/MM');
	const birthdayFormatted = birthday.format('MMMM DD');
	const birthDay = birthday.get('date');
	const birthMonth = birthday.format('MMMM');

	await mongodb.userBirthday.updateOne(
		{ userID: message.author.id },
		{ $set: { birthday: birthdayFormatted } },
		{ upsert: true }
	);

	const birthdaySetEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Birthday')
		.setDescription(`Successfully set your birthday to ${inlineCode(`${birthDay}${numSuffix(birthDay)} ${birthMonth}`)}!`)
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [birthdaySetEmbed] });
};

const upcomingBirthdays = async (message: Message): Promise<void> => {
	const upcomingBirthdayDayLimit = 14;

	const birthdays = await mongodb.userBirthday.find();

	let birthdaysList = '';
	let birthdayCount = 0;
	for (let i = 0; i < upcomingBirthdayDayLimit; i++) {
		const dayToCheck = dayjs().add(i, 'day').format('MMMM DD');

		for (const birthday of birthdays) {
			if (birthday.birthday === dayToCheck) {
				const birthdayUser = await fetchDiscordUser(message.client, birthday.userID);
				birthdaysList = birthdaysList.concat(`**${birthdayUser.tag}** - ${inlineCode(dayToCheck)}\n`);
				birthdayCount += 1;
			}
		}
	}

	const upcomingBirthdaysEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Upcoming Birthdays')
		.setDescription(`We have **${birthdayCount}** upcoming birthdays in the next ${upcomingBirthdayDayLimit} days!\
		\n\n${birthdaysList}`)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [upcomingBirthdaysEmbed] });
};

const birthdayCommand = async (args: BotCommand): Promise<void> => {
	const { commandArgs, message } = args;
	const operation = (commandArgs.shift() ?? 'undefined').toLowerCase();

	if (operation === 'set') {
		const birthDate = commandArgs.shift() ?? 'undefined';

		setBirthday(message, birthDate);
	}
	else if (operation === 'upcoming') {
		upcomingBirthdays(message);
	}
	else {
		sendError(message, `${inlineCode(operation)} is not a valid operation!\
		\n*For help, run ${inlineCode(`${BOT_PREFIX}help birthday`)}*`);
	}
};

export const birthday: Command = {
	devOnly: false,
	modOnly: false,
	run: birthdayCommand,
	type: 'Fun'
};
