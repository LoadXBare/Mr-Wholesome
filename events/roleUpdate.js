const { logChannelId } = require('../private/config.js');
const { roleUpdateColour } = require('../data/config.js');

module.exports = async (args) => {
	const roleBefore = args[0];
	const roleAfter = args[1];
	const logChannel = await roleAfter.client.channels.fetch(logChannelId);

	const embed = {
		author: { name: roleAfter.guild.name, iconURL: roleAfter.guild.iconURL() },
		title: 'Role Updated',
		fields: [],
		footer: { text: `Role ID: ${roleAfter.id}` },
		timestamp: Date.now(),
		color: roleUpdateColour
	};

	const roleChanges = ['name', 'color', 'hoist', 'mentionable'];
	roleChanges.forEach((change) => {
		if (roleBefore[change] !== roleAfter[change]) {
			const changeUpper = change.charAt(0).toUpperCase() + change.slice(1);
			if (change === 'color') {
				embed.fields.push({ name: changeUpper, value: `\`#${roleBefore[change].toString(16)}\` ➔ \`#${roleAfter[change].toString(16)}\`` });
			} else {
				embed.fields.push({ name: changeUpper, value: `\`${roleBefore[change]}\` ➔ \`${roleAfter[change]}\`` });
			}
		}
	});

	await logChannel.send({ embeds: [embed] });
};