const { events } = require('../data/config.js');

events.forEach(async (event) => {
	module.exports[event] = require(`./${event}.js`);
});