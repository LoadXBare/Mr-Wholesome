const { logChannelId } = require('../private/config.js');
const { memberJoinColour } = require('../data/config.js');

module.exports = async (args) => {
	const member = args[0];

	const logChannel = await member.client.channels.fetch(logChannelId);
	const embed = {
		author: { name: member.user.tag, iconURL: member.user.avatarURL() },
		thumbnail: { url: member.user.avatarURL() },
		title: 'Member Joined',
		fields: [
			{ name: 'Member', value: `<@${member.id}>` },
			{ name: 'Account Age', value: `Created: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }
		],
		footer: { text: `User ID: ${member.id}` },
		timestamp: Date.now(),
		color: memberJoinColour
	};

	await member.roles.add('847951907770073099', 'Joined Server');
	await logChannel.send({ embeds: [embed] });
};