const { color } = require('../data/config.json');

module.exports = async (msg) => {
	const timeNow = Date.now();
	const embed = {
		title: 'Tweet!',
		description: `:hourglass: \`${timeNow - msg.createdTimestamp}ms\``,
		color: color
	};
	await msg.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
};