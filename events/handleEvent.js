const onReady = async (client) => { console.log(`Logged in as ${client.user.tag}!`); };

const onMessageCreate = async (msg) => {
	if (msg.channel.type === 'GUILD_NEWS' && msg.content.includes('<@&855810156856082442>')) { await msg.crosspost(); }
	else if (msg.content.includes('sorry') && msg.author.id === '263104208079814656') { await msg.react('<:akiaBonque:876905175565086720>'); }
};

module.exports.handleEvent = async (event, options) => {
	const o = options;
	if (event === 'ready') { onReady(o.client); }
	else if (event === 'messageCreate') { onMessageCreate(o.msg); }
};