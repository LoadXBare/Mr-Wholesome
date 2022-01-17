const { logChannel } = require('../private/config.js');
const { memberLeaveColour } = require('../data/config.js');

module.exports = async (member) => {
	const logChnl = await member.client.channels.fetch(logChannel);
	const embed = {
		author: { name: member.user.tag, iconURL: member.user.avatarURL() },
		description: `**Member Left**\n<@${member.id}>`,
		fields: [{ name: 'Join Date', value: `Joined: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>` }],
		footer: { text: `User ID: ${member.id}` },
		timestamp: Date.now(),
		color: memberLeaveColour
	};

	logChnl.send({ embeds: [embed] });
};