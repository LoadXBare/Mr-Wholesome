import { roleMention } from '@discordjs/builders';
import { Message } from 'discord.js';
import { PREFIX } from '../../config/constants.js';
import { handleCommand } from '../../lib/command-handler.js';
import { emotes, theAkialytes } from '../../private/config.js';

export const messageCreate = (message: Message) => {
	const { content } = message;

	if (content.startsWith(PREFIX))
		handleCommand(message);

	// Auto-Publish any messages posted in Announcement channels that ping the @Streamies role
	if (message.channel.type === 'GUILD_NEWS' && content.includes(roleMention(theAkialytes.roles.Streamies)))
		message.crosspost();

	// React to Akia's message with akiaBonque if she says 'sorry' anywhere in her message
	if (content.search(/[s]+[o]+[r]+[y]+/mi) !== -1 && message.author.id !== message.client.user.id) {
		if (message.author.id === theAkialytes.ownerId) {
			message.react(theAkialytes.emotes['akiaBonque']);
			message.reply({ content: `NO SORRY ${theAkialytes.emotes.akiaBonque}` });
		} else if (Math.round(Math.random() * 100) <= 10) {
			message.react(theAkialytes.emotes['akiaBonque']);
			message.reply({ content: `NO SORRY ${theAkialytes.emotes.akiaBonque}` });
		}
	}

	// React to anyone's message with ARSON if they say 'arson' anywhere in their message
	if (content.search(/(?<!\S)[a]+[r]+[s]+[o]+[n]+/mi) !== -1)
		message.react(emotes.arson);
};
