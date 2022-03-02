import { formatEmoji, time, userMention } from '@discordjs/builders';
import { GuildMember, MessageEmbed, PartialGuildMember } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes } from '../../private/config.js';

export const guildMemberRemove = async (member: GuildMember | PartialGuildMember) => {
	const { user, client, id, joinedTimestamp } = member;

	const logChannel = await fetchLogChannel(member.guild.id, client);
	if (logChannel === null) return;

	const logEntry = new MessageEmbed()
		.setAuthor({ name: user.tag, iconURL: member.avatarURL() === null ? member.user.avatarURL() : member.avatarURL() })
		.setTitle(`${formatEmoji(emotes.memLeave)} Member Left`)
		.setFields([
			{ name: 'Member', value: userMention(id) },
			{ name: 'Join Date', value: `Joined: ${time(Math.ceil(joinedTimestamp / 1000), 'R')}` }
		])
		.setFooter({ text: `User ID: ${id}` })
		.setTimestamp(Date.now())
		.setColor(COLORS.NEGATIVE);

	await logChannel.send({ embeds: [logEntry] });
};
