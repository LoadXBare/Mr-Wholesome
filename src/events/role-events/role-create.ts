import { EmbedBuilder, Role } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';

export const roleCreate = async (role: Role): Promise<void> => {
	const { guild } = role;

	const logChannel = await fetchLogChannel(guild.id, role.client);
	if (logChannel === null) {
		return;
	}

	const logEntryEmbed = new EmbedBuilder()
		.setAuthor({
			name: guild.name,
			iconURL: guild.iconURL()
		})
		.setTitle('Role Created')
		.setFields([
			{
				name: 'Role',
				value: role.name
			}
		])
		.setFooter({ text: `Role ID: ${role.id}` })
		.setTimestamp()
		.setColor(COLORS.POSITIVE);

	logChannel.send({ embeds: [logEntryEmbed] });
};
