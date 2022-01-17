const { prefix } = require('../data/config.json');
const commandHandler = require('../lib/commandHandler.js');

module.exports = async (msg) => {
	// The message is a command
	if (msg.content.startsWith(prefix)) {
		const args = msg.content.split(' ');
		const cmd = args[0].slice(1);
		args.shift();

		commandHandler.handle(cmd, args, msg);
	}

	// Auto-Publish any messages posted in Announcement channels that ping the @Streamies role
	else if (msg.channel.type === 'GUILD_NEWS' && msg.content.includes('<@&855810156856082442>')) {
		await msg.crosspost().catch((reason) => {
			console.log('Could not publish message!');
			console.log(reason);
		});
	}

	// React to Akia's message with akiaBonque if she says 'sorry' anywhere in her message
	else if (msg.content.toLowerCase().includes('sorry') && msg.author.id === '263104208079814656') {
		await msg.react('<:akiaBonque:876905175565086720>');
	}
};