import { inlineCode, userMention } from '@discordjs/builders';
import { GuildMember, MessageEmbed, PartialGuildMember } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { relativeTime } from '../../lib/misc/relative-time.js';
import { emotes } from '../../private/config.js';

export const guildMemberRemove = async (member: GuildMember | PartialGuildMember) => {
	const { user, id } = member;
	const onWatchlist = await checkWatchlist(user);

	const logChannel = await fetchLogChannel(member.guild.id, member.client);
	if (logChannel === null)
		return;

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: 'Member Left',
			iconURL: emojiUrl(emotes.memLeave)
		})
		.setFields([
			{ name: 'Member', value: userMention(id) },
			{ name: 'Join Date', value: `Joined: ${inlineCode(relativeTime.fromNow(member.joinedAt))}` }
		])
		.setFooter({ text: `${user.tag} • User ID: ${id}`, iconURL: member.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.NEGATIVE);

	if (onWatchlist)
		logEntry.setThumbnail(emojiUrl(emotes.watchlist));

	logChannel.send({ embeds: [logEntry] });
};
