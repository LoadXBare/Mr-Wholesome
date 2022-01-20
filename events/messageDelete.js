const { logChannelId, ignoredChannels } = require('../private/config.js');
const { msgDeleteColour } = require('../data/config.js');

module.exports = async (args) => {
	if (ignoredChannels.includes(args[0].channel.id)) return;

	const msgDeleted = args[0];

	if (msgDeleted.author.bot) { return; }
	const logChannel = await msgDeleted.client.channels.fetch(logChannelId);
	const guild = await msgDeleted.client.guilds.fetch(msgDeleted.guildId);
	const action = await guild.fetchAuditLogs({ type: 'MESSAGE_DELETE', limit: 1 });
	const embed = {
		author: { name: msgDeleted.author.tag, iconURL: msgDeleted.author.avatarURL() },
		title: 'Message Deleted',
		fields: [
			{ name: 'Channel', value: `<#${msgDeleted.channelId}>` }
		],
		footer: { text: `Author ID: ${msgDeleted.author.id} • Deleted by: ${action.entries.at(0).executor.tag}` },
		timestamp: Date.now(),
		color: msgDeleteColour
	};

	// Message contains text
	if (msgDeleted.content !== '') { embed.fields.push({ name: 'Message', value: msgDeleted.content }); }

	// Message was deleted by the person who sent it
	if (action.entries.at(0).target.id !== msgDeleted.author.id) { embed.footer = { text: `Author ID: ${msgDeleted.author.id} • Deleted by: ${msgDeleted.author.tag}` }; }

	// Message contained an image
	if (typeof msgDeleted.attachments.at(0) !== 'undefined') { embed.image = { url: msgDeleted.attachments.at(0).url }; }

	await logChannel.send({ embeds: [embed] });
};