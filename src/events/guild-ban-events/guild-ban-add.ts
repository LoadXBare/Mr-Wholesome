import { EmbedBuilder, GuildBan, userMention } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { config } from '../../private/config.js';

export const guildBanAdd = async (ban: GuildBan): Promise<void> => {
	const { user } = ban;
	const onWatchlist = await checkWatchlist(user.id);
	const banReason = (await ban.guild.bans.fetch(user.id)).reason;

	const logChannel = await fetchLogChannel(ban.guild.id, ban.client);
	if (logChannel === null) {
		return;
	}

	const logEntryEmbed = new EmbedBuilder()
		.setAuthor({
			name: user.tag,
			iconURL: user.displayAvatarURL()
		})
		.setTitle('Member Banned')
		.setThumbnail(user.displayAvatarURL())
		.setFields([
			{ name: 'Member', value: userMention(user.id) },
			{ name: 'Reason', value: banReason === null ? 'No reason provided' : banReason }
		])
		.setFooter({ text: `User ID: ${user.id}` })
		.setTimestamp()
		.setColor(COLORS.NEGATIVE);

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(config.botEmoteUrls.warning);
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
