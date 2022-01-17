const { logChannel } = require('../private/config.js');
const { memberJoinColour } = require('../data/config.js');

module.exports = async (member) => {
	const logChnl = await member.client.channels.fetch(logChannel);
	const embed = {
		author: { name: member.user.tag, iconURL: member.user.avatarURL() },
		thumbnail: { url: member.user.avatarURL() },
		description: `**Member Joined**\n<@${member.id}>`,
		fields: [{ name: 'Account Age', value: `Created: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` }],
		footer: { text: `User ID: ${member.id}` },
		timestamp: Date.now(),
		color: memberJoinColour
	};

	await logChnl.send({ embeds: [embed] });
};