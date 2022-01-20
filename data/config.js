module.exports.prefix = '!';
module.exports.cmdColour = '#704f95';
module.exports.msgDeleteColour = '#b83333';
module.exports.msgEditColour = '#337cb8';
module.exports.memberJoinColour = '#2f9340';
module.exports.memberLeaveColour = '#912f2f';
module.exports.memberUpdateColour = this.msgEditColour;
module.exports.roleCreateColour = this.memberJoinColour;
module.exports.roleDeleteColour = this.memberLeaveColour;
module.exports.roleUpdateColour = this.msgEditColour;
module.exports.guildBanAddColour = this.msgDeleteColour;
module.exports.guildBanRemoveColour = this.msgEditColour;
module.exports.events = [
	'guildBanAdd',
	'guildBanRemove',
	'guildMemberAdd',
	'guildMemberRemove',
	'guildMemberUpdate',
	'messageCreate',
	'interactionCreate',
	'messageDelete',
	'messageUpdate',
	'ready',
	'roleCreate',
	'roleDelete',
	'roleUpdate'
];