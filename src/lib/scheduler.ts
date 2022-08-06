import { inlineCode, userMention } from '@discordjs/builders';
import dayjs from 'dayjs';
import { Client, Guild, TextChannel } from 'discord.js';
import { mongodb } from '../api/mongo.js';
import { LOG_COLORS } from '../config/constants.js';
import { config } from '../private/config.js';
import { fetchDiscordChannel } from './misc/fetch-discord-channel.js';
import { fetchGuildMember } from './misc/fetch-guild-member.js';

const checkRoles = async (guild: Guild): Promise<void> => {
	const akiasBirthday = 'September 03';
	const currentDate = dayjs().format('MMMM DD');
	const birthdayList = await mongodb.userBirthday.find();

	console.log(LOG_COLORS.NEUTRAL('Checking roles...'));

	if (currentDate !== akiasBirthday) {
		const member = await fetchGuildMember(guild, config.theAkialytesOwnerId);
		member.roles.add(config.roles['Birthday Role'], 'Definitely Akia\'s birthday');
	}

	/* -- NOTE --
	   This rate-limits the bot and will not scale well with database size.
	   Perhaps there is a more efficient way?
	*/
	for (let i = 0; i < birthdayList.length; i++) {
		const userID = birthdayList.at(i).userID;
		const member = await fetchGuildMember(guild, userID);

		if (member === null) {
			continue;
		}

		const memberRoles = member.roles.cache;
		const memberBirthday = birthdayList.at(i).birthday;
		const memberHasBirthdayRole = memberRoles.has(config.roles['Birthday Role']);
		const isMembersBirthday = memberBirthday === currentDate;

		if (userID === config.theAkialytesOwnerId) {
			continue;
		}
		else if (memberHasBirthdayRole && !isMembersBirthday) {
			member.roles.remove(config.roles['Birthday Role'], 'No longer birthday');
			console.log(LOG_COLORS.SUCCESS(`Removed birthday role from ${member.user.tag}!`));
		}
		else if (!memberHasBirthdayRole && isMembersBirthday) {
			member.roles.add(config.roles['Birthday Role'], 'Birthday');
			console.log(LOG_COLORS.SUCCESS(`Added birthday role to ${member.user.tag}!`));
		}
	}

	console.log(LOG_COLORS.SUCCESS('Roles checked!'));
};

const postBirthdayMessage = async (date: string, guild: Guild, birthdayChannel: TextChannel): Promise<void> => {
	const currentDate = dayjs().format('MMMM DD');
	const birthdaysToday = await mongodb.userBirthday.find({
		birthday: currentDate
	});

	let birthdayMessage = '';

	if (birthdaysToday.length === 0) {
		return;
	}
	else if (birthdaysToday.length === 1) {
		const userID = birthdaysToday.at(0).userID;
		const member = await fetchGuildMember(guild, userID);

		if (member === null) {
			return;
		}

		if (userID === config.theAkialytesOwnerId) {
			birthdayMessage = `Today is *definitely not* ${userMention(userID)}'s birthday, please continue your day as normal! ${config.emotes.akiaLaugh}`;
			member.roles.remove(config.roles['Birthday Role'], 'Definitely not Akia\'s birthday');
		}
		else {
			birthdayMessage = `Today is ${userMention(userID)}'s birthday!\nLet's wish them a happy birthday 🥳`;
			member.roles.add(config.roles['Birthday Role'], 'Birthday');
		}
		console.log(LOG_COLORS.SUCCESS(`Given birthday role to ${member.user.tag}!`));
	}
	else {
		birthdayMessage = 'We have more than 1 birthday today!\nLet\'s wish a happy birthday to ';
		for (let i = 0; i < birthdaysToday.length; i++) {
			const userID = birthdaysToday.at(i).userID;
			const member = await fetchGuildMember(guild, userID);

			if (member === null) {
				birthdayMessage = birthdayMessage.concat(inlineCode('[Member Left Server]'));
			}
			else {
				member.roles.add(config.roles['Birthday Role']);
				console.log(LOG_COLORS.SUCCESS(`Given birthday role to ${member.user.tag}!`));

				birthdayMessage = birthdayMessage.concat(`${userMention(userID)}`);
			}

			if (i === birthdaysToday.length - 2) {
				birthdayMessage = birthdayMessage.concat(' and ');
			}
			else if (i < birthdaysToday.length - 2) {
				birthdayMessage = birthdayMessage.concat(', ');
			}
		}
		birthdayMessage = birthdayMessage.concat(' 🥳');
	}

	birthdayChannel.send(birthdayMessage);
	console.log(LOG_COLORS.SUCCESS(`Birthday message posted to #${birthdayChannel.name}!`));
};

const birthdayScheduler = async (client: Client): Promise<void> => {
	const theAkialytesGuild = await client.guilds.fetch(config.theAkialytesGuildId);
	const birthdayChannel = await fetchDiscordChannel(theAkialytesGuild, config.birthdayChannelId) as TextChannel;
	const intervalMins = 30;
	let lastRunDate = 'undefined';

	setInterval(async () => {
		const currentDate = dayjs().format('MMMM DD');
		const currentHour = dayjs().get('hour');

		checkRoles(theAkialytesGuild);
		if (currentDate === lastRunDate || currentHour > 1) {
			return;
		}
		lastRunDate = currentDate;

		postBirthdayMessage(currentDate, theAkialytesGuild, birthdayChannel);
	}, intervalMins * 60 * 1000);
};

export const startScheduler = (client: Client): void => {
	birthdayScheduler(client);
};
