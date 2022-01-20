const commands = require('../commands');

module.exports.handle = async (cmd, args, msg) => {
	if (cmd === 'ping') commands.ping(msg);
	if (cmd === 'postrolemenu') commands.postRoleMenu(msg);
};