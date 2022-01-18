module.exports = async (args) => {
	const client = args[0];

	await client.user.setPresence({ activities: [{ name: 'over The Akialytes', type: 'WATCHING' }] });
	console.log(`Successfully logged in as ${client.user.tag}!`);
};