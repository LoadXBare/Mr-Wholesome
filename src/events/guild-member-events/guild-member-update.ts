import { formatEmoji } from '@discordjs/builders';
import { GuildMember, MessageEmbed, PartialGuildMember } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes } from '../../private/config.js';

export const guildMemberUpdate = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
	const { nickname: oldNickname } = oldMember;
	const { nickname: newNickname, user, id } = newMember;

	// Only interested in nickname changes, not role changes
	if (oldNickname === newNickname)
		return;

	const logChannel = await fetchLogChannel(newMember.guild.id, newMember.client);
	if (logChannel === null)
		return;

	const formatNickname = (nick: string) => (nick === null ? 'None' : nick);

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: user.tag,
			iconURL: newMember.displayAvatarURL()
		})
		.setTitle(`${formatEmoji(emotes.memUpdate)} Nickname Changed`)
		.setFields([
			{ name: 'Before', value: formatNickname(oldNickname) },
			{ name: 'After', value: formatNickname(newNickname) }
		])
		.setFooter({ text: `User ID: ${id}` })
		.setTimestamp()
		.setColor(COLORS.NEUTRAL);

	logChannel.send({ embeds: [logEntry] });
};
