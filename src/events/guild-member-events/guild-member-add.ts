import { formatEmoji, time, userMention } from '@discordjs/builders';
import { GuildMember, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes, theAkialytes } from '../../private/config.js';

export const guildMemberAdd = async (member: GuildMember) => {
	const { user, id, roles } = member;

	const logChannel = await fetchLogChannel(member.guild.id, member.client);
	if (logChannel === null)
		return;

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: user.tag,
			iconURL: member.displayAvatarURL()
		})
		.setThumbnail(user.displayAvatarURL())
		.setTitle(`${formatEmoji(emotes.memJoin)} Member Joined`)
		.setFields([
			{ name: 'Member', value: userMention(id) },
			{ name: 'Account Age', value: `Created: ${time(user.createdAt, 'R')}` }
		])
		.setFooter({ text: `User ID: ${id}` })
		.setTimestamp()
		.setColor(COLORS.POSITIVE);

	roles.add(theAkialytes.roles.Akialyte.id, 'Joined Server');
	logChannel.send({ embeds: [logEntry] });
};
