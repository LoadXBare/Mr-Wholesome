import dayjs from 'dayjs';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { client } from '../../bot.js';
import { COLORS } from '../../config/constants.js';
import { config } from '../../private/config.js';
import { fetchDiscordChannel } from './fetch-discord-channel.js';

export const log = async (...content: Array<unknown>): Promise<void> => {
	const guild = await client.guilds.fetch(config.guildIDs['Load\'s Lounge']);
	const logChannel = await fetchDiscordChannel(guild, config.channelIDs.botLogs) as TextChannel;
	const currentTime = dayjs();
	const clientReadyTime = dayjs(client.readyTimestamp);
	const daysUptime = currentTime.diff(clientReadyTime, 'day');
	const hoursUptime = currentTime.diff(clientReadyTime, 'hour');
	const minutesUptime = currentTime.diff(clientReadyTime, 'minute');
	const secondsUptime = currentTime.diff(clientReadyTime, 'second');
	const uptime = `${daysUptime} days, ${hoursUptime} hours, ${minutesUptime} minutes & ${secondsUptime} seconds`;

	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: `[${dayjs().format('DD/MM/YYYY HH:mm:ss.SSS')}]`,
			iconURL: client.user.displayAvatarURL()
		})
		.setDescription(content.join(' '))
		.setFooter({ text: `Uptime: ${uptime}` })
		.setColor(COLORS.NEUTRAL);

	console.log(`[${dayjs().format('DD/MM/YYYY HH:mm:ss.SSS')}]`, ...content);
	if (config.environment === 'production') {
		logChannel.send({ embeds: [logEmbed] });
	}
};
