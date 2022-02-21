import { MessageEmbed, Role } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';

export const roleDelete = async (role: Role) => {
	const { client, guild, name, id } = role;

	const logChannel = await fetchLogChannel(guild.id, client);
	if (logChannel === null) return;

	const logEntry = new MessageEmbed()
		.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
		.setTitle('Role Deleted')
		.setFields([
			{ name: 'Role', value: name }
		])
		.setFooter({ text: `Role ID: ${id}` })
		.setTimestamp(Date.now())
		.setColor(COLORS.NEGATIVE);

	await logChannel.send({ embeds: [logEntry] });
};