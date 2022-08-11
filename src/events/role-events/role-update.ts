import { EmbedBuilder, inlineCode, Role } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { RoleChanges } from '../../index.js';
import { fetchLogChannel } from '../../lib/misc/fetch-log-channel.js';

export const roleUpdate = async (oldRole: Role, newRole: Role): Promise<void> => {
	const { guild } = newRole;

	const logChannel = await fetchLogChannel(guild.id, newRole.client);
	if (logChannel === null) {
		return;
	}

	const logEntryEmbed = new EmbedBuilder()
		.setAuthor({
			name: guild.name,
			iconURL: guild.iconURL()
		})
		.setTitle('Role Updated')
		.setFooter({ text: `Role ID: ${newRole.id}` })
		.setTimestamp()
		.setColor(COLORS.NEUTRAL);

	const roleChanges: Array<RoleChanges> = ['name', 'color', 'hoist', 'mentionable'];

	for (const change of roleChanges) {
		if (oldRole[change] === newRole[change]) {
			continue;
		}

		const roleChangeUppercase = change.charAt(0).toUpperCase() + change.slice(1);
		if (change === 'color') {
			logEntryEmbed.addFields([
				{
					name: roleChangeUppercase,
					value: `${inlineCode(`#${oldRole[change].toString(16)}`)} ➔ ${inlineCode(`#${newRole[change].toString(16)}`)}`
				}
			]);
		}
		else {
			logEntryEmbed.addFields([
				{
					name: roleChangeUppercase,
					value: `${inlineCode(oldRole[change].toString())} ➔ ${inlineCode(newRole[change].toString())}`
				}
			]);
		}
	}

	// Don't send an embed with no changes listed, happens when a role's position or permissions are updated
	if (typeof logEntryEmbed.data.fields === 'undefined') {
		return;
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
