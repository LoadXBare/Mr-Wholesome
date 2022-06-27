import { inlineCode, userMention } from '@discordjs/builders';
import dayjs from 'dayjs';
import { GuildMember, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { config } from '../../private/config.js';

export const guildMemberRemove = async (member: GuildMember): Promise<void> => {
	const { user, id } = member;
	const onWatchlist = await checkWatchlist(user.id);

	const logChannel = await fetchLogChannel(member.guild.id, member.client);
	if (logChannel === null) {
		return;
	}

	const logEntryEmbed = new MessageEmbed()
		.setAuthor({
			name: 'Member Left',
			iconURL: emojiUrl(config.botEmotes.memLeave)
		})
		.setFields([
			{ name: 'Member', value: userMention(id) },
			{ name: 'Join Date', value: `Joined: ${inlineCode(dayjs(member.joinedAt).fromNow())}` }
		])
		.setFooter({ text: `${user.tag} • User ID: ${id}`, iconURL: member.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.NEGATIVE);

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(emojiUrl(config.botEmotes.watchlist));
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
