import { userMention } from '@discordjs/builders';
import { GuildBan, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { config } from '../../private/config.js';

export const guildBanAdd = async (ban: GuildBan): Promise<void> => {
	const { user, reason } = ban;
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
		.setTitle('Member Banned')
		.setThumbnail(user.displayAvatarURL())
		.setFields([
			{ name: 'Member', value: userMention(user.id) },
			{ name: 'Reason', value: reason === undefined ? 'None' : reason }
		])
		.setFooter({ text: `User ID: ${user.id}` })
		.setTimestamp()
		.setColor(COLORS.NEGATIVE);

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(emojiUrl(config.botEmotes.watchlist));
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
