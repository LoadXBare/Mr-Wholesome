import { userMention } from '@discordjs/builders';
import { GuildBan, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { config } from '../../private/config.js';

export const guildBanRemove = async (ban: GuildBan): Promise<void> => {
	const { user } = ban;
	const onWatchlist = await checkWatchlist(user.id);

	const logChannel = await fetchLogChannel(ban.guild.id, ban.client);
	if (logChannel === null) {
		return;
	}

	const logEntryEmbed = new MessageEmbed()
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

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(emojiUrl(config.botEmotes.watchlist));
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
