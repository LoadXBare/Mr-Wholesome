const { guildBanRemoveColour } = require('../data/config');
const { logChannelId } = require('../private/config.js');

module.exports = async (args) => {
	const ban = args[0];
	const logChannel = await ban.client.channels.fetch(logChannelId);

	const embed = {
		author: { name: ban.user.tag, iconURL: ban.user.avatarURL() },
		thumbnail: { url: ban.user.avatarURL() },
		title: 'Member Unbanned',
		fields: [
			{ name: 'Member', value: `<@${ban.user.id}>` }
		],
		footer: { text: `User ID: ${ban.user.id}` },
		timestamp: Date.now(),
		color: guildBanRemoveColour
	};

	await logChannel.send({ embeds: [embed] });
};