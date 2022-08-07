import { EmbedBuilder, inlineCode, Role } from 'discord.js';
import { RoleChanges } from '../..';
import { COLORS } from '../../config/constants.js';
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

	roleChanges.forEach((change) => {
		if (oldRole[change] === newRole[change]) {
			return;
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
	});

	// Don't send an embed with no changes listed, happens when only a role's position is updated
	if (logEntryEmbed.data.fields.length === 0) {
		return;
	}

	logChannel.send({ embeds: [logEntryEmbed] });
};
