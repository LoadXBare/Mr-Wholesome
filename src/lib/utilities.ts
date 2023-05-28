import { Attachment, Collection, TextChannel, inlineCode } from "discord.js";
import { client } from "../index.js";
import { Discord, database } from "./config.js";

export class Utils {
	/** 
	 * Generates a random integer between min and max (inclusive).
	 * @param min The minimum value that can be returned
	 * @param max The maximum value that can be returned
	 * @returns Randomly generated integer
	*/
	static randomInt(min: number, max: number) {
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
	static log(message: string, positive: boolean, ...payload: any) {
		console.log(`${positive ? '✅' : '❌'} | ${message}\n`, ...payload);
	}

	/**
	 * Permanently stores attachments by sending them to the media channel.
	 * @param attachments The Discord.JS Collection of attachments to store
	 * @returns Array of objects containg each attachment's link, masked link and type
	 */
	static async storeAttachments(attachments: Collection<string, Attachment>) {
		const mediaChannel = await client.channels.fetch(process.env.MEDIA_STORAGE_CHANNEL_ID!) as TextChannel;
		const storedAttachments: Array<{ link: string, maskedLink: string, type: string; }> = [];

		for (const [_string, attachment] of attachments) {
			if (attachment.size >= Discord.MAX_ATTACHMENT_SIZE) {
				storedAttachments.push({
					link: '',
					maskedLink: `${inlineCode(attachment.name)} [No link, size >${Math.round(Discord.MAX_ATTACHMENT_SIZE / 1_000_000)}MB]`,
					type: attachment.contentType ?? ''
				});
				continue;
			}

			const storedMessage = await mediaChannel.send({ files: [{ attachment: attachment.url }] })
				.catch((e) => Utils.log('An error occurred while sending a message!', false, e));
			if (storedMessage === undefined) continue;

			const storedAttachment = storedMessage.attachments.at(0);
			storedAttachments.push({
				link: storedAttachment?.url ?? '',
				maskedLink: `[${storedAttachment?.name ?? ''}](${storedAttachment?.url ?? ''})`,
				type: storedAttachment?.contentType ?? 'N/A'
			});
		}

		return storedAttachments;
	}

	/**
	 * Converts a date into a relative time string.
	 * @param date The date to convert
	 * @returns The relative time from the specified date
	 */
	static getRelativeTimeString(date: Date | number) {
		// Allow dates or times to be passed
		const timeMs = typeof date === "number" ? date : date.getTime();

		// Get the amount of seconds between the given date and now
		const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

		// Array reprsenting one minute, hour, day, week, month, etc in seconds
		const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];

		// Array equivalent to the above but in the string representation of the units
		const units: Array<Intl.RelativeTimeFormatUnit> = ["second", "minute", "hour", "day", "week", "month", "year"];

		// Grab the ideal cutoff unit
		const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));

		// Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
		// is one day in seconds, so we can divide our seconds by this to get the # of days
		const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

		// Intl.RelativeTimeFormat do its magic
		const rtf = new Intl.RelativeTimeFormat('en', { numeric: "auto" });
		return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
	}

	/**
	 * Allows for a synchronous delay in code execution if called with `await`.
	 * @param ms The time, in milliseconds, to sleep
	 * @returns Empty promise after specified delay has elapsed
	 */
	static sleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
	}
}

export class DatabaseUtils {
	/**
	 * Initialises a guild within the database to ensure its entry exists for other operations.
	 * @param guildID The ID of the guild to initialise
	 */
	static async #initialiseGuild(guildID: string) {
		await database.guild.upsert({
			where: { guildID },
			create: { guildID, GuildConfig: { create: {} } },
			update: {}
		})
			.catch((e) => Utils.log('An error occurred while upserting the database!', false, e));;
	}

	/**
	 * Fetches the log channel if one exists for the specified guild.
	 * @param guildID The ID of the guild the channel is in
	 * @returns Channel object if exists, or null otherwise
	 */
	static async fetchGuildLogChannel(guildID: string | null) {
		if (guildID === null) return null;
		await this.#initialiseGuild(guildID);

		const guildConfig = await database.guildConfig.findFirst({
			where: { guildID }
		})
			.catch((e) => Utils.log('An error occurred while fetching from the database!', false, e));

		const logChannelID = guildConfig?.logChannelID;
		if (logChannelID === undefined || logChannelID === '') return null;

		const logChannel = await client.channels.fetch(logChannelID)
			.catch((e) => Utils.log('An error occurred while fetching a channel!', false, e)) as TextChannel;
		if (logChannel === undefined) return null;

		return logChannel;
	}

	/**
	 * Updates the ID of the log channel currently stored in the database.
	 * @param guildID The ID of the guild the channel is in
	 * @param logChannelID The ID of the new channel
	 * @returns True if update successful, or false otherwise
	 */
	static async updateGuildLogChannel(guildID: string | null, logChannelID: string | null) {
		if (guildID === null || logChannelID === null) return false;
		await this.#initialiseGuild(guildID);

		const result = await database.guildConfig.update({
			where: { guildID },
			data: { logChannelID }
		})
			.catch((e) => Utils.log('An error occurred while updating the database!', false, e));

		if (result === undefined) return false;
		return true;
	}

	/**
	 * Resets the log channel for the specified guild.
	 * @param guildID The ID of the guild
	 * @returns True if reset successful, or false otherwise
	 */
	static async resetGuildLogChannel(guildID: string | null) {
		if (guildID === null) return false;
		await this.#initialiseGuild(guildID);

		const result = await database.guildConfig.update({
			where: { guildID },
			data: { logChannelID: '' }
		})
			.catch((e) => Utils.log('An error occurred while updating the database!', false, e));

		if (result === undefined) return false;
		return true;
	}

	/**
	 * Adds a channel to the list of event ignored channels in a guild.
	 * @param guildID The ID of the guild the channel is in
	 * @param channelID The ID of the channel to add
	 * @returns True if addition successful, or false otherwise
	 */
	static async addEventIgnoredChannel(guildID: string | null, channelID: string | null) {
		if (guildID === null || channelID === null) return false;
		await this.#initialiseGuild(guildID);

		const guildConfig = await database.guildConfig.findFirst({
			where: { guildID }
		})
			.catch((e) => Utils.log('An error occurred while fetching from the database!', false, e));

		const eventIgnoredChannelIDs = guildConfig?.eventIgnoredChannelIDs ?? [];
		if (eventIgnoredChannelIDs.includes(channelID)) return false;
		eventIgnoredChannelIDs.push(channelID);

		const result = await database.guildConfig.update({
			where: { guildID },
			data: { eventIgnoredChannelIDs }
		})
			.catch((e) => Utils.log('An error occurred while updating the database!', false, e));

		if (result === undefined) return false;
		return true;
	}

	/**
	 * Removes a channel from the list of event ingored channels in a guild.
	 * @param guildID The ID of the guild the channel is in
	 * @param channelID The ID of the channel to remove
	 * @returns True if removal successful, or false otherwise
	 */
	static async removeEventIgnoredChannel(guildID: string | null, channelID: string | null) {
		if (guildID === null || channelID === null) return false;
		await this.#initialiseGuild(guildID);

		const guildConfig = await database.guildConfig.findFirst({
			where: { guildID }
		})
			.catch((e) => Utils.log('An error occurred while fetching from the database!', false, e));

		const oldEventIgnoredChannelIDs = guildConfig?.eventIgnoredChannelIDs ?? [];
		if (!oldEventIgnoredChannelIDs.includes(channelID)) return false;

		const eventIgnoredChannelIDs = oldEventIgnoredChannelIDs.filter((id) => id !== channelID);
		const result = await database.guildConfig.update({
			where: { guildID },
			data: { eventIgnoredChannelIDs }
		})
			.catch((e) => Utils.log('An error occurred while updating the database!', false, e));

		if (result === undefined) return false;
		return true;
	}

	/**
	 * Checks whether a channel has events ignored in the specified guild.
	 * @param guildID The ID of the guild the channel is in
	 * @param channelID The ID of the channel to check
	 * @returns True if the channel has events ignored, or false otherwise
	 */
	static async checkIfChannelHasEventsIgnored(guildID: string | null, channelID: string | null) {
		if (guildID === null || channelID === null) return true;
		await this.#initialiseGuild(guildID);

		const guildConfig = await database.guildConfig.findFirst({
			where: { guildID }
		})
			.catch((e) => Utils.log('An error occurred while fetching from the database!', false, e));;

		const eventIgnoredChannelIDs = guildConfig?.eventIgnoredChannelIDs ?? [];
		return eventIgnoredChannelIDs.includes(channelID);
	}
}