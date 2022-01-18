const { logChannelId } = require('../private/config.js');
const { memberUpdateColour } = require('../data/config.js');

module.exports = async (args) => {
	const oldMember = args[0];
	const newMember = args[1];

	// Only interested in Member nickname changes, not role changes
	if (oldMember.nickname === newMember.nickname) return;

	const logChannel = await newMember.client.channels.fetch(logChannelId);
	const oldMemberNick = oldMember.nickname === null ? 'None' : oldMember.nickname;
	const newMemberNick = newMember.nickname === null ? 'None' : newMember.nickname;

	const embed = {
		author: { name: newMember.user.tag, iconURL: newMember.user.avatarURL() },
		title: 'Nickname Changed',
		fields: [
			{ name: 'Before', value: oldMemberNick },
			{ name: 'After', value: newMemberNick }
		],
		footer: { text: `User ID: ${newMember.id}` },
		timestamp: Date.now(),
		color: memberUpdateColour
	};

	logChannel.send({ embeds: [embed] });
};