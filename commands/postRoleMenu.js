const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { cmdColour } = require('../data/config.js');

module.exports = async (msg) => {
	// If user who ran command isn't a mod, return
	if (!msg.member.roles.cache.has('793573941251407902')) return;

	await msg.delete();
	const pronounsMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('role_menu_1')
			.setPlaceholder('Pronouns')
			.setOptions({
				label: 'He/Him',
				value: '822966603868143688'
			}, {
				label: 'They/Them',
				value: '822966658536701993'
			}, {
				label: 'She/Her',
				value: '822966644674134026'
			}, {
				label: 'Any/All',
				value: '848491198359273504'
			})
	);

	const miscellaneousMenu = new MessageActionRow().addComponents(
		new MessageSelectMenu()
			.setCustomId('role_menu_2')
			.setPlaceholder('Miscellaneous')
			.setOptions({
				label: 'Minecrafter',
				value: '847809650615255081',
				emoji: '⛏️'
			}, {
				label: 'Crafter',
				value: '852923517892821012',
				emoji: '🪛'
			}, {
				label: 'Artist',
				value: '822966855387316244',
				emoji: '🎨'
			}, {
				label: 'Writer',
				value: '822966869568651326',
				emoji: '✍️'
			}, {
				label: 'Musician',
				value: '822966891269324871',
				emoji: '🎵'
			}, {
				label: 'Streamies',
				value: '855810156856082442',
				description: 'For Twitch stream notifications!',
				emoji: '🎥'
			}, {
				label: 'Server Events',
				value: '855810611433701386',
				description: 'For various Discord server events! Like game nights, movie nights, etc...',
				emoji: '🎞️'
			})
	);

	const embed = {
		author: { name: msg.guild.name, iconURL: msg.guild.iconURL() },
		title: 'Role Menu',
		description: 'Use the menus below to add/remove 1 or more roles!\
		\n\nTo add a role simply click on the role in the dropdown menu.\
		\nTo remove a role click on a role you already have applied in the dropdown menu.',
		footer: { text: 'NOTE: If you cannot see the Select Menus below this embed, update your Discord client/app.' },
		color: cmdColour
	};

	await msg.channel.send({ embeds: [embed], components: [pronounsMenu, miscellaneousMenu] });
};