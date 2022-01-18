const { msgEditColour } = require('../data/config.js');
const { logChannelId } = require('../private/config.js');

module.exports = async (args) => {
	const msgBefore = args[0];
	const msgAfter = args[1];

	if (msgAfter.author.bot) return;
	if (msgBefore.content === msgAfter.content) return;

	const maxMsgLength = 800;
	const logChannel = await msgAfter.client.channels.fetch(logChannelId);
	let msgBeforeContent = msgBefore.content;
	let msgAfterContent = msgAfter.content;

	const GetIndexOfFirstEdit = async () => {
		const lengthOfLongestMsg = msgBeforeContent.length > msgAfterContent.length ? msgAfterContent.length : msgBeforeContent.length;
		for (let i = 0; i < lengthOfLongestMsg; i++) {
			if (msgBeforeContent[i] === msgAfterContent[i]) continue;
			else return i;
		}
		if (msgBeforeContent.length !== msgAfterContent.length) return lengthOfLongestMsg - 1;
	};

	let indexOfFirstEdit = await GetIndexOfFirstEdit();
	indexOfFirstEdit = indexOfFirstEdit - 10 < 0 ? 0 : indexOfFirstEdit - 10;

	msgBeforeContent = `${indexOfFirstEdit === 0 ? '' : '...'}${msgBeforeContent.slice(indexOfFirstEdit)}`;
	if (msgBeforeContent.length > maxMsgLength) msgBeforeContent = `${msgBeforeContent.slice(0, maxMsgLength)}...`;
	msgAfterContent = `${indexOfFirstEdit === 0 ? '' : '...'}${msgAfterContent.slice(indexOfFirstEdit)}`;
	if (msgAfterContent.length > maxMsgLength) msgAfterContent = `${msgAfterContent.slice(0, maxMsgLength)}...`;

	const embed = {
		author: { name: msgAfter.author.tag, iconURL: msgAfter.author.avatarURL() },
		title: 'Message Edited',
		fields: [
			{ name: 'Channel', value: `<#${msgAfter.channel.id}> [Jump to Message](${msgAfter.url})` },
			{ name: 'Before', value: msgBeforeContent },
			{ name: 'After', value: msgAfterContent }
		],
		footer: { text: `Author ID: ${msgAfter.author.id}` },
		timestamp: Date.now(),
		color: msgEditColour
	};

	await logChannel.send({ embeds: [embed] });
};