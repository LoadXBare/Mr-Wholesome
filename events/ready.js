module.exports = async (client) => {
	await client.user.setPresence({ activities: [{ name: 'over The Akialytes', type: 'WATCHING' }] });
	console.log(`Successfully logged in as ${client.user.tag}!`);
};