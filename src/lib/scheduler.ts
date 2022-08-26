import dayjs from 'dayjs';
import { Client, EmbedBuilder, inlineCode, roleMention, userMention } from 'discord.js';
import schedule from 'node-schedule';
import { mongodb } from '../api/mongo.js';
import { COLORS } from '../config/constants.js';
import { config } from '../private/config.js';
import { fetchDiscordTextChannel } from './misc/fetch-discord-text-channel.js';
import { fetchDiscordUser } from './misc/fetch-discord-user.js';
import { fetchGuildMember } from './misc/fetch-guild-member.js';
import { log } from './misc/log.js';

const checkRoles = async (client: Client): Promise<void> => {
	const guild = await client.guilds.fetch(config.guildIDs['The Akialytes']);
	const akiasBirthday = 'September 03';
	const currentDate = dayjs().utc().format('MMMM DD');
	const birthdayList = await mongodb.userBirthday.find();

	log('Checking roles...');
	const startTime = dayjs().utc().valueOf();

	if (currentDate !== akiasBirthday) {
		const member = await fetchGuildMember(guild, config.userIDs.Akialyne);
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

		if (userID === config.userIDs.Akialyne) {
			continue;
		}
		else if (memberHasBirthdayRole && !isMembersBirthday) {
			member.roles.remove(config.roles['Birthday Role'], 'No longer birthday');
			log(`Removed birthday role from ${member.user.tag}!`);
		}
		else if (!memberHasBirthdayRole && isMembersBirthday) {
			member.roles.add(config.roles['Birthday Role'], 'Birthday');
			log(`Added birthday role to ${member.user.tag}!`);
		}
	}

	log(`Roles checked! (${(dayjs().utc().valueOf() - startTime).toLocaleString()}ms)`);
};

const postBirthdayMessage = async (client: Client): Promise<void> => {
	const guild = await client.guilds.fetch(config.guildIDs['The Akialytes']);
	const birthdayChannel = await fetchDiscordTextChannel(guild, config.channelIDs.birthdayAnnouncements);
	const currentDate = dayjs().utc().format('MMMM DD');
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

		if (userID === config.userIDs.Akialyne) {
			birthdayMessage = `Today is *definitely not* ${userMention(userID)}'s birthday, please continue your day as normal! ${config.emotes.akiaLaugh}`;
			member.roles.remove(config.roles['Birthday Role'], 'Definitely not Akia\'s birthday');
		}
		else {
			birthdayMessage = `Today is ${userMention(userID)}'s birthday!\nLet's wish them a happy birthday 🥳`;
			member.roles.add(config.roles['Birthday Role'], 'Birthday');
		}
		log(`Given birthday role to ${member.user.tag}!`);
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
				log(`Given birthday role to ${member.user.tag}!`);

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
	log(`Birthday message posted to #${birthdayChannel.name}!`);
};

const birthday = (client: Client): void => {
	checkRoles(client);
	postBirthdayMessage(client);
};

export const warning = async (client: Client, nextRunDate: Date): Promise<void> => {
	const warnings = await mongodb.guildWarning.find({
		guildID: config.guildIDs['The Akialytes']
	});
	const guild = await client.guilds.fetch(config.guildIDs['The Akialytes']);
	const warningReminderChannel = await fetchDiscordTextChannel(guild, config.channelIDs.warningReminders);

	const warnedUsersIDList: Array<string> = [];
	for (const warning of warnings) {
		if (!warnedUsersIDList.includes(warning.warnedUserID)) {
			warnedUsersIDList.push(warning.warnedUserID);
		}
	}

	let warningsList = '';
	for (const warnedUserID of warnedUsersIDList) {
		const latestWarning = await mongodb.guildWarning.findOne({
			warnedUserID: warnedUserID,
			guildID: config.guildIDs['The Akialytes']
		}).sort({
			warningDate: 'descending'
		});

		const warningAgeInMonths = dayjs().utc().diff(dayjs(latestWarning.warningDate), 'month');
		if (warningAgeInMonths >= 6) {
			const warnedUser = await fetchDiscordUser(client, latestWarning.warnedUserID);
			warningsList = warningsList.concat(`\n**${warningAgeInMonths} months ago** - **${warnedUser.tag}** (${inlineCode(latestWarning.id)})`);
		}
	}

	let rolePing = roleMention(config.roles.Mods);
	if (warningsList.length === 0) {
		warningsList = 'There are no users that were last warned 6 or more months ago!';
		rolePing = null;
	}

	const warningReminderEmbed = new EmbedBuilder()
		.setTitle('The following users were last warned 6 or more months ago')
		.setDescription(warningsList)
		.setFooter({ text: `Next Reminder: ${dayjs(nextRunDate).format('MMMM DD, YYYY')}` })
		.setColor(COLORS.NEUTRAL);

	warningReminderChannel.send({ content: rolePing, embeds: [warningReminderEmbed] });
};

export const wsPingHistory: Array<number> = [];

export const startScheduler = (client: Client): void => {
	// Runs at 12:00am UTC each day
	const birthdayScheduler = schedule.scheduleJob('0 0 * * * ', () => {
		birthday(client);
		log(`Birthday scheduler ran! Next run date: ${dayjs(birthdayScheduler.nextInvocation()).format('MMMM DD, YYYY')}`);
	});
	log(`Birthday scheduler will run on ${dayjs(birthdayScheduler.nextInvocation()).format('MMMM DD, YYYY')}!`);

	// Runs at 12:00am UTC on the first day of each month
	const warningScheduler = schedule.scheduleJob('0 0 1 * *', () => {
		warning(client, warningScheduler.nextInvocation());
		log(`Warning scheduler ran! Next run date: ${dayjs(warningScheduler.nextInvocation()).format('MMMM DD, YYYY')}`);
	});
	log(`Warning scheduler will run on ${dayjs(warningScheduler.nextInvocation()).format('MMMM DD, YYYY')}!`);

	schedule.scheduleJob('*/5 * * * *', () => {
		wsPingHistory.push(client.ws.ping);
		if (wsPingHistory.length > 500) {
			wsPingHistory.shift();
		}
	});
};
