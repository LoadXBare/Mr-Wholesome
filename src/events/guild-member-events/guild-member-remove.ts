import { formatEmoji, time, userMention } from '@discordjs/builders';
import { GuildMember, MessageEmbed, PartialGuildMember } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes } from '../../private/config.js';

export const guildMemberRemove = async (member: GuildMember | PartialGuildMember) => {
	const { user, id } = member;

	const logChannel = await fetchLogChannel(member.guild.id, member.client);
	if (logChannel === null)
		return;

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: user.tag,
			iconURL: member.displayAvatarURL()
		})
		.setTitle(`${formatEmoji(emotes.memLeave)} Member Left`)
		.setFields([
			{ name: 'Member', value: userMention(id) },
			{ name: 'Join Date', value: `Joined: ${time(member.joinedAt, 'R')}` }
		])
		.setFooter({ text: `User ID: ${id}` })
		.setTimestamp()
		.setColor(COLORS.NEGATIVE);

	logChannel.send({ embeds: [logEntry] });
};
