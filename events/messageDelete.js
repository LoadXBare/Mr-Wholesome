const { logChannel } = require('../private/config.json');
const { msgDeleteColour } = require('../data/config.json');

module.exports = async (msgDeleted) => {
	if (msgDeleted.author.bot) { return; }
	const chnl = await msgDeleted.client.channels.fetch(logChannel);
	const guild = await msgDeleted.client.guilds.fetch(msgDeleted.guildId);
	const action = await guild.fetchAuditLogs({ type: 'MESSAGE_DELETE', limit: 1 });
	const embed = {
		author: { name: msgDeleted.author.tag, iconURL: msgDeleted.author.avatarURL() },
		description: `**Message deleted in <#${msgDeleted.channelId}>**`,
		footer: { text: `Author ID: ${msgDeleted.author.id} • Deleted by: ${action.entries.at(0).executor.tag}` },
		timestamp: Date.now(),
		color: msgDeleteColour
	};

	// Message contains text
	if (msgDeleted.content !== '') { embed.fields = [{ name: 'Deleted', value: msgDeleted.content }]; }

	// Message was deleted by the person who sent it
	if (action.entries.at(0).target.id !== msgDeleted.author.id) { embed.footer = { text: `Author ID: ${msgDeleted.author.id} • Deleted by: ${msgDeleted.author.tag}` }; }

	// Message contained an image
	if (typeof msgDeleted.attachments.at(0) !== 'undefined') { embed.image = { url: msgDeleted.attachments.at(0).url }; }

	await chnl.send({ embeds: [embed] });
};