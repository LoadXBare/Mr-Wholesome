const { cmdColour } = require('../data/config.js');

module.exports = async (msg) => {
	const timeNow = Date.now();
	const embed = {
		title: 'Tweet!',
		description: `:hourglass: \`${timeNow - msg.createdTimestamp}ms\``,
		color: cmdColour
	};
	await msg.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
};