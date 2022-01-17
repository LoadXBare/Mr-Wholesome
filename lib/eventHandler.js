const events = require('../events');

module.exports.handle = async (event, options) => {
	const { msg, msgBefore, msgAfter, client } = options;

	if (event === 'ready') events.ready(client);
	else if (event === 'messageCreate') events.messageCreate(msg);
	else if (event === 'messageDelete') events.messageDelete(msg);
	else if (event === 'messageUpdate') events.messageUpdate(msgBefore, msgAfter);
};