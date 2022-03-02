import { MessageEmbed, Role } from 'discord.js';
import { RoleChanges } from '../..';
import { COLORS } from '../../config/constants.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel';

export const roleUpdate = async (oldRole: Role, newRole: Role) => {
	const { client, guild, id } = newRole;

	const logChannel = await fetchLogChannel(guild.id, client);
	if (logChannel === null) return;

	const logEntry = new MessageEmbed()
		.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
		.setTitle('Role Updated')
		.setFooter({ text: `Role ID: ${id}` })
		.setTimestamp(Date.now())
		.setColor(COLORS.NEUTRAL);

	const roleChanges: Array<RoleChanges> = ['name', 'color', 'hoist', 'mentionable'];

	roleChanges.forEach((change) => {
		if (oldRole[change] === newRole[change]) return;

		const roleChangeUppercase = change.charAt(0).toUpperCase() + change.slice(1);
		if (change === 'color') {
			logEntry.addField(
				roleChangeUppercase,
				`\`#${oldRole[change].toString(16)}\` ➔ \`#${newRole[change].toString(16)}\``
			);
		} else {
			logEntry.addField(
				roleChangeUppercase,
				`\`${oldRole[change]}\` ➔ \`${newRole[change]}\``
			);
		}
	});

	// Don't send an embed with no changes listed, happens when only a role's position is updated
	if (logEntry.fields.length === 0) return;

	await logChannel.send({ embeds: [logEntry] });
};
