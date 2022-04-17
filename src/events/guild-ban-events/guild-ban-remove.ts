import { userMention } from '@discordjs/builders';
import { GuildBan, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes } from '../../private/config.js';

export const guildBanRemove = async (ban: GuildBan) => {
	const { user } = ban;
	const onWatchlist = await checkWatchlist(user);

	const logChannel = await fetchLogChannel(ban.guild.id, ban.client);
	if (logChannel === null)
		return;

	const logEntry = new MessageEmbed()
		.setAuthor({
			name: user.tag,
			iconURL: user.displayAvatarURL()
		})
		.setThumbnail(user.displayAvatarURL())
		.setTitle('Member Unbanned')
		.setFields([
			{ name: 'Member', value: userMention(user.id) }
		])
		.setFooter({ text: `User ID: ${user.id}` })
		.setTimestamp()
		.setColor(COLORS.POSITIVE);

	if (onWatchlist)
		logEntry.setThumbnail(emojiUrl(emotes.watchlist));

	logChannel.send({ embeds: [logEntry] });
};
