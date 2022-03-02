import { formatEmoji, time, userMention } from '@discordjs/builders';
import { GuildMember, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes, theAkialytes } from '../../private/config.js';

export const guildMemberAdd = async (member: GuildMember) => {
	const { user, client, id, roles } = member;

	const logChannel = await fetchLogChannel(member.guild.id, client);
	if (logChannel === null) return;

	const logEntry = new MessageEmbed()
		.setAuthor({ name: user.tag, iconURL: member.avatarURL() === null ? member.user.avatarURL() : member.avatarURL() })
		.setThumbnail(user.avatarURL())
		.setTitle(`${formatEmoji(emotes.memJoin)} Member Joined`)
		.setFields([
			{ name: 'Member', value: userMention(id) },
			{ name: 'Account Age', value: `Created: ${time(Math.ceil(user.createdTimestamp / 1000), 'R')}` }
		])
		.setFooter({ text: `User ID: ${id}` })
		.setTimestamp(Date.now())
		.setColor(COLORS.POSITIVE);

	await roles.add(theAkialytes.roles.Akialyte.id, 'Joined Server');
	await logChannel.send({ embeds: [logEntry] });
};
