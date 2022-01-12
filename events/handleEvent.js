module.exports.handleEvent = async (event, client, msg) => {
	switch (event) {
	case 'ready':
		onReady(client);
		break;
	case 'messageCreate':
		onMessageCreate(msg);
		break;
	default:
		console.error('Unhandled Event!');
	}
};

const onReady = async (client) => { console.log(`Logged in as ${client.user.tag}!`); };

const onMessageCreate = async (msg) => {
	if (msg.channel.type === 'GUILD_NEWS' && msg.content.includes('<@&855810156856082442>')) { msg.crosspost(); }
};