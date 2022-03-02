import { Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import { BotCommand } from '..';
import { COLORS } from '../config/constants.js';
import { theAkialytes } from '../private/config.js';

class embedBase {
	constructor(message: Message) {
		const { author, member } = message;
		return new MessageEmbed()
			.setAuthor({ name: author.tag, iconURL: member.avatarURL() === null ? author.avatarURL() : member.avatarURL() })
			.setTitle('Get Roles');
	}
}

export const rolebuttonmenus = async (args: BotCommand) => {
	const { commandArgs, message } = args;
	const { client, guild } = message;

	if (typeof commandArgs.at(0) === 'undefined') {
		const error = new MessageEmbed(new embedBase(message))
			.setDescription(':warning: Channel must be non-empty string!')
			.setColor(COLORS.FAIL);

		await message.reply({ embeds: [error] });
		return;
	}

	const channelId = commandArgs.at(0).replace(/\D/g, '');

	try {
		await client.channels.fetch(channelId);
	} catch {
		const error = new MessageEmbed(new embedBase(message))
			.setDescription(`:warning: "${channelId}" is not a valid Channel ID!`)
			.setColor(COLORS.FAIL);

		await message.reply({ embeds: [error] });
		return;
	}

	const channelToSendMenu = await client.channels.fetch(channelId) as TextChannel;

	const rolesMenuInfo = new MessageEmbed(new embedBase(message))
		.setAuthor({ name: guild.name, iconURL: guild.iconURL() })
		.setDescription('Click any of the buttons below to add or remove roles!\
		\n\nClicking on a button **without** having that role will give it to you.\
		\nClicking on a button **while** having that role will remove it from you.')
		.setColor(COLORS.COMMAND);

	const pronounMenu = new MessageEmbed()
		.setImage('https://cdn.discordapp.com/attachments/868149626321141780/942885475205668894/Pronouns.png') // PLACEHOLDER IMAGE
		.setColor(COLORS.COMMAND);
	const pronounMenuButtons = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles['He/Him'].id}`)
			.setLabel('He/Him')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles['They/Them'].id}`)
			.setLabel('They/Them')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles['She/Her'].id}`)
			.setLabel('She/Her')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles['Any/All'].id}`)
			.setLabel('Any/All')
			.setStyle('PRIMARY'),
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles['Other Pronouns (Ask Me)'].id}`)
			.setLabel('Other (Ask Me)')
			.setStyle('PRIMARY')
	);

	const otherMenu = new MessageEmbed()
		.setImage('https://cdn.discordapp.com/attachments/868149626321141780/945251321794134046/Miscellaenous.png') // PLACEHOLDER IMAGE
		.setColor(COLORS.COMMAND);
	const otherMenuButtons = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles.Minecrafter.id}`)
			.setLabel('Minecrafter')
			.setStyle('SECONDARY'),
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles.Crafter.id}`)
			.setLabel('Crafter')
			.setStyle('SECONDARY'),
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles.Artist.id}`)
			.setLabel('Artist')
			.setStyle('SECONDARY'),
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles.Writer.id}`)
			.setLabel('Writer')
			.setStyle('SECONDARY'),
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles.Musician.id}`)
			.setLabel('Musician')
			.setStyle('SECONDARY')
	);
	const otherMenuButtons2 = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles.Streamies.id}`)
			.setLabel('Streamies')
			.setStyle('SECONDARY'),
		new MessageButton()
			.setCustomId(`role: ${theAkialytes.roles['Server Events'].id}`)
			.setLabel('Server Events')
			.setStyle('SECONDARY')
	);

	await channelToSendMenu.send({ embeds: [rolesMenuInfo] });
	await channelToSendMenu.send({ embeds: [pronounMenu], components: [pronounMenuButtons] });
	await channelToSendMenu.send({ embeds: [otherMenu], components: [otherMenuButtons, otherMenuButtons2] });
};
