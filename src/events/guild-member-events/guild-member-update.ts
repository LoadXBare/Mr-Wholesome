import { EmbedBuilder, GuildMember } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { config } from '../../private/config.js';

export const guildMemberUpdate = async (oldMember: GuildMember, newMember: GuildMember): Promise<void> => {
	const { nickname: oldNickname } = oldMember;
	const { nickname: newNickname, user, id } = newMember;
	const onWatchlist = await checkWatchlist(user.id);
	const logChannel = await fetchLogChannel(newMember.guild.id, newMember.client);

	// Only interested in nickname changes, not role changes
	if (oldNickname === newNickname || logChannel === null) {
		return;
	}

	const formatNickname = (nick: string): string => (nick === null ? 'None' : nick);

	const logEntryEmbed = new EmbedBuilder()
		.setAuthor({
			name: 'Nickname Changed'
		})
		.setFields([
			{ name: 'Before', value: formatNickname(oldNickname) },
			{ name: 'After', value: formatNickname(newNickname) }
		])
		.setFooter({ text: `${user.tag} • User ID: ${id}`, iconURL: newMember.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.NEUTRAL);

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(config.botEmoteUrls.watchlist);
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
