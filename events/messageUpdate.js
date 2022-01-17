const { msgEditColour } = require('../data/config.js');
const { logChannel } = require('../private/config.js');

module.exports = async (msgBefore, msgAfter) => {
	if (msgAfter.author.bot) return;
	if (msgBefore.content === msgAfter.content) return;

	const maxMsgLength = 800;
	const logChnl = await msgAfter.client.channels.fetch(logChannel);
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

	msgBeforeContent = `...${msgBeforeContent.slice(indexOfFirstEdit)}`;
	if (msgBeforeContent.length > maxMsgLength) msgBeforeContent = `${msgBeforeContent.slice(0, maxMsgLength)}...`;
	msgAfterContent = `...${msgAfterContent.slice(indexOfFirstEdit)}`;
	if (msgAfterContent.length > maxMsgLength) msgAfterContent = `${msgAfterContent.slice(0, maxMsgLength)}...`;

	const embed = {
		author: {
			name: msgAfter.author.tag,
			iconURL: msgAfter.author.avatarURL()
		},
		description: `**Message edited in <#${msgAfter.channel.id}>** [Jump to Message](${msgAfter.url})`,
		fields: [{
			name: 'Before',
			value: msgBeforeContent
		},
		{
			name: 'After',
			value: msgAfterContent
		}],
		footer: { text: `Author ID: ${msgAfter.author.id}` },
		timestamp: Date.now(),
		color: msgEditColour
	};

	await logChnl.send({ embeds: [embed] });
};