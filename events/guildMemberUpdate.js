const { logChannel } = require('../private/config.js');
const { memberUpdateColour } = require('../data/config.js');

module.exports = async (oldMember, newMember) => {
	// Only interested in Member nickname changes, not role changes
	if (oldMember.nickname === newMember.nickname) return;

	const logChnl = await newMember.client.channels.fetch(logChannel);
	const oldMemberNick = oldMember.nickname === null ? 'None' : oldMember.nickname;
	const newMemberNick = newMember.nickname === null ? 'None' : newMember.nickname;

	const embed = {
		author: { name: newMember.user.tag, iconURL: newMember.user.avatarURL() },
		description: '**Nickname Changed**',
		fields: [{ name: 'Before', value: oldMemberNick }, { name: 'After', value: newMemberNick }],
		footer: { text: `User ID: ${newMember.id}` },
		timestamp: Date.now(),
		color: memberUpdateColour
	};

	logChnl.send({ embeds: [embed] });
};