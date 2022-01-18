const { logChannelId } = require('../private/config.js');
const { memberLeaveColour } = require('../data/config.js');

module.exports = async (args) => {
	const member = args[0];

	const logChannel = await member.client.channels.fetch(logChannelId);
	const embed = {
		author: { name: member.user.tag, iconURL: member.user.avatarURL() },
		title: 'Member Left',
		fields: [
			{ name: 'Member', value: `<@${member.id}>` },
			{ name: 'Join Date', value: `Joined: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>` }
		],
		footer: { text: `User ID: ${member.id}` },
		timestamp: Date.now(),
		color: memberLeaveColour
	};

	logChannel.send({ embeds: [embed] });
};