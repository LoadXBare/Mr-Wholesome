import dayjs from 'dayjs';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { client } from '../../bot.js';
import { COLORS } from '../../config/constants.js';
import { config } from '../../private/config.js';
import { fetchDiscordChannel } from './fetch-discord-channel.js';
import { fetchUptime } from './fetch-uptime.js';

export const log = async (...content: Array<unknown>): Promise<void> => {
	const guild = await client.guilds.fetch(config.guildIDs['Load\'s Lounge']);
	const logChannel = await fetchDiscordChannel(guild, config.channelIDs.botLogs) as TextChannel;
	const uptime = fetchUptime();
	const uptimeText = `${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes & ${uptime.seconds} seconds`;

	const logEmbed = new EmbedBuilder()
		.setAuthor({
			name: `[${dayjs().format('DD/MM/YYYY HH:mm:ss.SSS')}]`,
			iconURL: client.user.displayAvatarURL()
		})
		.setDescription(content.join(' '))
		.setFooter({ text: `Uptime: ${uptimeText}` })
		.setColor(COLORS.NEUTRAL);

	console.log(`[${dayjs().format('DD/MM/YYYY HH:mm:ss.SSS')}]`, ...content);
	if (config.environment === 'production') {
		logChannel.send({ embeds: [logEmbed] });
	}
};
