import { formatEmoji } from '@discordjs/builders';
import { GuildMember, MessageEmbed, PartialGuildMember } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes } from '../../private/config.js';

export const guildMemberUpdate = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
	const { nickname: oldNickname } = oldMember;
	const { nickname: newNickname, client, user, id } = newMember;

	// Only interested in nickname changes, not role changes
	if (oldNickname === newNickname) return;

	const logChannel = await fetchLogChannel(newMember.guild.id, client);
	if (logChannel === null) return;

	const oldNick = oldNickname === null ? 'None' : oldNickname;
	const newNick = newNickname === null ? 'None' : newNickname;

	const logEntry = new MessageEmbed()
		.setAuthor({ name: user.tag, iconURL: newMember.avatarURL() === null ? newMember.user.avatarURL() : newMember.avatarURL() })
		.setTitle(`${formatEmoji(emotes.memUpdate)} Nickname Changed`)
		.setFields([
			{ name: 'Before', value: oldNick },
			{ name: 'After', value: newNick }
		])
		.setFooter({ text: `User ID: ${id}` })
		.setTimestamp(Date.now())
		.setColor(COLORS.NEUTRAL);

	await logChannel.send({ embeds: [logEntry] });
};
