import dayjs from 'dayjs';
import { EmbedBuilder, GuildMember, inlineCode, userMention } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { config } from '../../private/config.js';

export const guildMemberRemove = async (member: GuildMember): Promise<void> => {
	const { user, id } = member;
	const onWatchlist = await checkWatchlist(user.id);

	const logChannel = await fetchLogChannel(member.guild.id, member.client);
	if (logChannel === null) {
		return;
	}

	const logEntryEmbed = new EmbedBuilder()
		.setAuthor({
			name: 'Member Left'
		})
		.setFields([
			{ name: 'Member', value: userMention(id) },
			{ name: 'Join Date', value: `Joined: ${inlineCode(dayjs(member.joinedAt).fromNow())}` }
		])
		.setFooter({ text: `${user.tag} • User ID: ${id}`, iconURL: member.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.NEGATIVE);

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(config.botEmoteUrls.watchlist);
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
