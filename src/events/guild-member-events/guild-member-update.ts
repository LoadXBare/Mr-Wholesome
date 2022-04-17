import { GuildMember, MessageEmbed, PartialGuildMember } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes } from '../../private/config.js';

export const guildMemberUpdate = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => {
	const { nickname: oldNickname } = oldMember;
	const { nickname: newNickname, user, id } = newMember;
	const onWatchlist = await checkWatchlist(user);

	// Only interested in nickname changes, not role changes
	if (oldNickname === newNickname)
		return;

	const logChannel = await fetchLogChannel(newMember.guild.id, newMember.client);
	if (logChannel === null)
		return;

	const formatNickname = (nick: string) => (nick === null ? 'None' : nick);

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: 'Nickname Changed',
			iconURL: emojiUrl(emotes.memUpdate)
		})
		.setFields([
			{ name: 'Before', value: formatNickname(oldNickname) },
			{ name: 'After', value: formatNickname(newNickname) }
		])
		.setFooter({ text: `${user.tag} • User ID: ${id}`, iconURL: newMember.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.NEUTRAL);

	if (onWatchlist)
		logEntry.setThumbnail(emojiUrl(emotes.watchlist));

	logChannel.send({ embeds: [logEntry] });
};
