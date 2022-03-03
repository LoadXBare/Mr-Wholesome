import { userMention } from '@discordjs/builders';
import { GuildBan, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';

export const guildBanAdd = async (ban: GuildBan) => {
	const { user, reason } = ban;

	const logChannel = await fetchLogChannel(ban.guild.id, ban.client);
	if (logChannel === null)
		return;

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: user.tag,
			iconURL: user.displayAvatarURL()
		})
		.setTitle('Member Banned')
		.setThumbnail(user.displayAvatarURL())
		.setFields([
			{ name: 'Member', value: userMention(user.id) },
			{ name: 'Reason', value: typeof reason === 'undefined' ? 'None' : reason }
		])
		.setFooter({ text: `User ID: ${user.id}` })
		.setTimestamp()
		.setColor(COLORS.NEGATIVE);

	logChannel.send({ embeds: [logEntry] });
};
