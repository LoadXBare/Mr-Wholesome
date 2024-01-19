import { Birthday } from '@prisma/client';
import {
  Attachment, Collection, Message, TextChannel,
  inlineCode,
} from 'discord.js';
import client from '../index.js';
import { Discord, database } from './config.js';

/**
   * Generates a random integer between min and max (inclusive).
   * @param min The minimum value that can be returned
   * @param max The maximum value that can be returned
   * @returns Randomly generated integer
  */
function randomInt(min: number, max: number) {
  const range = max - min + 1;
  const randomNumber = Math.floor(Math.random() * range) + min;
  return randomNumber;
}

/**
 * Logs a stylised message to the console.
 * @param message The message to log to the console
 * @param positive Whether the reason for logging is positive
 * @param payload Any additional payload to log to the console
 */
function log(message: string, positive: boolean, ...payload: any) {
  console.log(`${positive ? '✔️' : '❌'} | ${message}\n`, ...payload);
}

/**
 * Permanently stores attachments by sending them to the media channel.
 * @param attachments The Discord.JS Collection of attachments to store
 * @returns Array of objects containg each attachment's link, masked link and type
 */
async function storeAttachments(attachments: Collection<string, Attachment>) {
  const mediaChannel = await client.channels.fetch(process.env.MEDIA_STORAGE_CHANNEL_ID ?? '') as TextChannel;
  const storedAttachments: Array<{ link: string, maskedLink: string, type: string; }> = [];

  const storedPromiseMessages: Array<Promise<undefined | Message>> = [];
  attachments.forEach((attachment) => {
    if (attachment !== undefined) {
      if (attachment.size >= Discord.MAX_ATTACHMENT_SIZE) {
        storedAttachments.push({
          link: '',
          maskedLink: `${inlineCode(attachment.name)} [No link, size >${Math.round(Discord.MAX_ATTACHMENT_SIZE / 1_000_000)}MB]`,
          type: attachment.contentType ?? '',
        });
      } else {
        storedPromiseMessages.push(mediaChannel.send({ files: [{ attachment: attachment.url }] }));
      }
    }
  });

  const storedMessages = await Promise.all(storedPromiseMessages);
  storedMessages.forEach((message) => {
    if (message !== undefined) {
      const storedAttachment = message.attachments.at(0);

      if (storedAttachment !== undefined) {
        storedAttachments.push({
          link: storedAttachment.url,
          maskedLink: `[${storedAttachment.name}](${storedAttachment.url})`,
          type: storedAttachment.contentType ?? 'N/A',
        });
      }
    }
  });

  return storedAttachments;
}

/**
 * Converts a date into a relative time string.
 * @param date The date to convert
 * @returns The relative time from the specified date
 */
function getRelativeTimeString(date: Date | number) {
  // Allow dates or times to be passed
  const timeMs = typeof date === 'number' ? date : date.getTime();

  // Get the amount of seconds between the given date and now
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  // Array reprsenting one minute, hour, day, week, month, etc in seconds
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];

  // Array equivalent to the above but in the string representation of the units
  const units: Array<Intl.RelativeTimeFormatUnit> = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

  // Grab the ideal cutoff unit
  const unitIndex = cutoffs.findIndex((cutoff) => cutoff > Math.abs(deltaSeconds));

  // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
  // is one day in seconds, so we can divide our seconds by this to get the # of days
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // Intl.RelativeTimeFormat do its magic
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

/**
 * Allows for a synchronous delay in code execution if called with `await`.
 * @param ms The time, in milliseconds, to sleep
 * @returns Empty promise after specified delay has elapsed
 */
async function sleep(ms: number) {
  /* eslint no-new: "off" */
  new Promise((r) => setTimeout(r, ms));
}

/**
 * Finds the suffix of the specified number.
 * @param number The number to find the suffix for
 * @returns The number's suffix
 */
function nth(number: number) {
  const suffixes: { [key in Intl.LDMLPluralRule]: string; } = {
    zero: 'th',
    one: 'st',
    two: 'nd',
    few: 'rd',
    many: 'th',
    other: 'th',
  };
  const suffixCategory = new Intl.PluralRules('en', { type: 'ordinal' }).select(number);

  return suffixes[suffixCategory];
}

/**
 * Formats a day and month in the form "d MMMM".
 * @param day The day to format
 * @param month The month to format
 * @returns Formatted date
 */
function formatDate(day: number, month: number) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const formattedDay = `${day}${nth(day)}`;
  const formattedMonth = months.at(month) ?? 'N/A';

  return `${formattedDay} ${formattedMonth}`;
}

/**
 * Adds a channel to the list of event ignored channels in a guild.
 * @param guildID The ID of the guild the channel is in
 * @param channelID The ID of the channel to add
 * @returns True if addition successful, or false otherwise
 */
async function addEventIgnoredChannel(guildID: string | null, channelID: string | null) {
  if (guildID === null || channelID === null) return false;

  const guildConfig = await database.guildConfig.findFirst({
    where: { guildID },
  })
    .catch((e) => log('An error occurred while fetching from the database!', false, e));

  const eventIgnoredChannelIDs = guildConfig?.eventIgnoredChannelIDs ?? [];
  if (eventIgnoredChannelIDs.includes(channelID)) return false;
  eventIgnoredChannelIDs.push(channelID);

  const result = await database.guildConfig.update({
    where: { guildID },
    data: { eventIgnoredChannelIDs },
  })
    .catch((e) => log('An error occurred while updating the database!', false, e));

  if (result === undefined) return false;
  return true;
}

/**
 * Removes a channel from the list of event ingored channels in a guild.
 * @param guildID The ID of the guild the channel is in
 * @param channelID The ID of the channel to remove
 * @returns True if removal successful, or false otherwise
 */
async function removeEventIgnoredChannel(guildID: string | null, channelID: string | null) {
  if (guildID === null || channelID === null) return false;

  const guildConfig = await database.guildConfig.findFirst({
    where: { guildID },
  })
    .catch((e) => log('An error occurred while fetching from the database!', false, e));

  const oldEventIgnoredChannelIDs = guildConfig?.eventIgnoredChannelIDs ?? [];
  if (!oldEventIgnoredChannelIDs.includes(channelID)) return false;

  const eventIgnoredChannelIDs = oldEventIgnoredChannelIDs.filter((id) => id !== channelID);
  const result = await database.guildConfig.update({
    where: { guildID },
    data: { eventIgnoredChannelIDs },
  })
    .catch((e) => log('An error occurred while updating the database!', false, e));

  if (result === undefined) return false;
  return true;
}

/**
 * Checks whether a channel has events ignored in the specified guild.
 * @param guildID The ID of the guild the channel is in
 * @param channelID The ID of the channel to check
 * @returns True if the channel has events ignored, or false otherwise
 */
async function isIgnoringEvents(guildID: string | null, channelID: string | null) {
  if (guildID === null || channelID === null) return true;

  const guildConfig = await database.guildConfig.findFirst({
    where: { guildID },
  })
    .catch((e) => log('An error occurred while fetching from the database!', false, e));

  const eventIgnoredChannelIDs = guildConfig?.eventIgnoredChannelIDs ?? [];
  return eventIgnoredChannelIDs.includes(channelID);
}

/**
 * Fetches all channels in a guild that has events ignored.
 * @param guildID The ID of the guild to fetch channels for
 * @returns Array of channel IDs that have events ignored
 */
async function fetchEventIgnoredChannels(guildID: string | null) {
  if (guildID === null) return [];

  const guildConfig = await database.guildConfig.findFirst({
    where: { guildID },
  })
    .catch((e) => log('An error occurred while fetching from the database!', false, e));

  const eventIgnoredChannelIDs = guildConfig?.eventIgnoredChannelIDs ?? [];
  return eventIgnoredChannelIDs;
}

/**
 * Sets or updates a user's birthday.
 * @param userID The ID of the user to set the birthday for
 * @param day The day of the user's birthday
 * @param month The month of the user's birthday
 * @returns Prisma Birthday object
 */
async function setBirthday(userID: string, day: number, month: number) {
  const date = formatDate(day, month);
  const result = await database.birthday.upsert({
    where: { userID },
    create: { date, userID },
    update: { date },
  });

  return result;
}

/**
 * Fetches all upcoming birthdays from the database.
 * @param days The number of days in the future to return birthdays for
 * @returns Array of upcoming Prisma Birthday objects
 */
async function fetchUpcomingBirthdays(days: number) {
  const upcomingDays = new Array(days)
    .fill(new Date().getUTCDate())
    .map((value, index) => formatDate(value + index, new Date().getUTCMonth()));

  const birthdays = await database.birthday.findMany();
  const upcomingBirthdays: Array<Birthday> = [];
  upcomingDays.forEach((day) => {
    birthdays.forEach((birthday) => {
      if (birthday.date === day) upcomingBirthdays.push(birthday);
    });
  });

  return upcomingBirthdays;
}

// TODO: CONVERT TO CLASS SYSTEM

export const Utils = {
  randomInt,
  log,
  storeAttachments,
  getRelativeTimeString,
  sleep,
  nth,
};

export const DatabaseUtils = {
  addEventIgnoredChannel,
  removeEventIgnoredChannel,
  isIgnoringEvents,
  fetchEventIgnoredChannels,
  setBirthday,
  fetchUpcomingBirthdays,
};
