const { logChannelId } = require('../private/config.js');
const { roleDeleteColour } = require('../data/config.js');

module.exports = async (args) => {
	const role = args[0];
	const logChannel = await role.client.channels.fetch(logChannelId);

	const embed = {
		author: { name: role.guild.name, iconURL: role.guild.iconURL() },
		title: 'Role Deleted',
		fields: [
			{ name: 'Role', value: role.name }
		],
		footer: { text: `Role ID: ${role.id}` },
		timestamp: Date.now(),
		color: roleDeleteColour
	};

	await logChannel.send({ embeds: [embed] });
};