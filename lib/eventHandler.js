const events = require('../events');

module.exports.handle = async (event, args) => events[event](args);