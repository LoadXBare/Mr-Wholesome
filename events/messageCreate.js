const { prefix } = require('../data/config.js');
const commandHandler = require('../lib/commandHandler.js');

module.exports = async (args) => {
	const msg = args[0];

	// The message is a command
	if (msg.content.startsWith(prefix)) {
		const cmdArgs = msg.content.split(' ');
		const cmd = cmdArgs[0].slice(1).toLowerCase();
		cmdArgs.shift();

		commandHandler.handle(cmd, cmdArgs, msg);
	}

	// Auto-Publish any messages posted in Announcement channels that ping the @Streamies role
	else if (msg.channel.type === 'GUILD_NEWS' && msg.content.includes('<@&855810156856082442>')) {
		await msg.crosspost();
	}

	// React to Akia's message with akiaBonque if she says 'sorry' anywhere in her message
	else if (msg.content.search(/[Ss]+[Oo]+[Rr]+[Yy]+/g) !== -1 && msg.author.id === '263104208079814656') {
		await msg.react('<:akiaBonque:876905175565086720>');
	}
};