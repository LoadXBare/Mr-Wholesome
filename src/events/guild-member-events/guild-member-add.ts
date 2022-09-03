import dayjs from 'dayjs';
import { EmbedBuilder, GuildMember, inlineCode, userMention } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { checkWatchlist } from '../../lib/misc/check-watchlist.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { log } from '../../lib/misc/log.js';
import { config } from '../../private/config.js';

export const guildMemberAdd = async (member: GuildMember): Promise<void> => {
	const { user, id, roles } = member;
	const onWatchlist = await checkWatchlist(user.id);

	const logChannel = await fetchLogChannel(member.guild.id, member.client);
	if (logChannel === null) {
		return;
	}

	const logEntryEmbed = new EmbedBuilder()
		.setAuthor({
			name: 'Member Joined'
		})
		.setThumbnail(user.displayAvatarURL())
		.setFields([
			{ name: 'Member', value: userMention(id) },
			{ name: 'Account Age', value: `Created: ${inlineCode(dayjs(user.createdAt).fromNow())}` }
		])
		.setFooter({ text: `${user.tag} • User ID: ${id}`, iconURL: user.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.POSITIVE);

	if (onWatchlist) {
		logEntryEmbed.setThumbnail(config.botEmoteUrls.warning);
	}

	log(`Adding role Akialyte to ${member.user.tag}...`);
	roles.add(config.roles.Akialyte, 'Joined Server').catch((e) => {
		log(`An error occurred while adding role Akialyte to ${member.user.tag}!\n`, e);
	});

	logChannel.send({ embeds: [logEntryEmbed] });
};
