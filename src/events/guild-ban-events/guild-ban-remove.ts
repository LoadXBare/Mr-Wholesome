import { userMention } from '@discordjs/builders';
import { GuildBan, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';

export const guildBanRemove = async (ban: GuildBan) => {
	const { user, client } = ban;

	const logChannel = await fetchLogChannel(ban.guild.id, client);
	if (logChannel === null) return;

	const logEntry = new MessageEmbed()
		.setAuthor({ name: user.tag, iconURL: user.avatarURL() })
		.setThumbnail(user.avatarURL())
		.setTitle('Member Unbanned')
		.setFields([
			{ name: 'Member', value: userMention(user.id) }
		])
		.setFooter({ text: `User ID: ${user.id}` })
		.setTimestamp(Date.now())
		.setColor(COLORS.POSITIVE);

	await logChannel.send({ embeds: [logEntry] });
};
