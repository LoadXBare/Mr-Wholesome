import { time, userMention } from '@discordjs/builders';
import { GuildMember, MessageEmbed } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { emojiUrl } from '../../lib/misc/emoji-url.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';
import { emotes, theAkialytes } from '../../private/config.js';

export const guildMemberAdd = async (member: GuildMember) => {
	const { user, id, roles } = member;

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
			{ name: 'Account Age', value: `Created: ${time(user.createdAt, 'R')}` }
		])
		.setFooter({ text: `${user.tag} • User ID: ${id}`, iconURL: user.displayAvatarURL() })
		.setTimestamp()
		.setColor(COLORS.POSITIVE);

	roles.add(theAkialytes.roles.Akialyte, 'Joined Server');
	logChannel.send({ embeds: [logEntry] });
};
