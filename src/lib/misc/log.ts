import dayjs from 'dayjs';
import { EmbedBuilder } from 'discord.js';
import { client } from '../../bot.js';
import { COLORS } from '../../config/constants.js';
import { config } from '../../private/config.js';
import { fetchDiscordTextChannel } from './fetch-discord-text-channel.js';
import { fetchUptime } from './fetch-uptime.js';

export const log = async (...content: Array<unknown>): Promise<void> => {
	const guild = await client.guilds.fetch(config.guildIDs['Bot Assets']);
	const logChannel = await fetchDiscordTextChannel(guild, config.channelIDs.botLogs);
	const uptime = fetchUptime();
	const uptimeText = `${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes & ${uptime.seconds} seconds`;

	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: `[${dayjs().utc().format('DD/MM/YYYY HH:mm:ss.SSS')}]`,
			iconURL: client.user.displayAvatarURL()
		})
		.setDescription(content.join(' '))
		.setFooter({ text: `Uptime: ${uptimeText}` })
		.setColor(COLORS.NEUTRAL);

	console.log(`[${dayjs().utc().format('DD/MM/YYYY HH:mm:ss.SSS')}]`, ...content);
	if (config.environment === 'production') {
		logChannel.send({ embeds: [logEmbed] });
	}
};
