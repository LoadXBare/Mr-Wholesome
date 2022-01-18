const { guildBanAddColour } = require('../data/config.js');
const { logChannelId } = require('../private/config.js');

module.exports = async (args) => {
	const ban = args[0];
	const logChannel = await ban.client.channels.fetch(logChannelId);

	const embed = {
		author: { name: ban.user.tag, iconURL: ban.user.avatarURL() },
		thumbnail: { url: ban.user.avatarURL() },
		title: 'Member Banned',
		fields: [
			{ name: 'Member', value: `<@${ban.user.id}>` },
			{ name: 'Reason', value: `${typeof ban.reason === 'undefined' ? 'None' : ban.reason}` }
		],
		footer: { text: `User ID: ${ban.user.id}` },
		timestamp: Date.now(),
		color: guildBanAddColour
	};

	await logChannel.send({ embeds: [embed] });
};