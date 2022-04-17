import { inlineCode, userMention } from '@discordjs/builders';
import { GuildMember, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { relativeTime } from '../../lib/misc/relative-time.js';
import { emotes, theAkialytes } from '../../private/config.js';

export const guildMemberAdd = async (member: GuildMember) => {
	const { user, id, roles } = member;
	const onWatchlist = await checkWatchlist(user);

	const logChannel = await fetchLogChannel(member.guild.id, member.client);
	if (logChannel === null)
		return;

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: 'Member Joined',
			iconURL: emojiUrl(emotes.memJoin)
		})
		.setThumbnail(user.displayAvatarURL())
		.setFields([
			{ name: 'Member', value: userMention(id) },
			{ name: 'Account Age', value: `Created: ${inlineCode(relativeTime.fromNow(user.createdAt))}` }
		])
		.setFooter({ text: `${user.tag} • User ID: ${id}`, iconURL: user.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.POSITIVE);

	if (onWatchlist)
		logEntry.setThumbnail(emojiUrl(emotes.watchlist));

	roles.add(theAkialytes.roles.Akialyte, 'Joined Server');
	logChannel.send({ embeds: [logEntry] });
};
