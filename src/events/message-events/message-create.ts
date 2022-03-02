import { roleMention } from '@discordjs/builders';
import { Message } from 'discord.js';
import { PREFIX } from '../../config/constants.js';
import { handleCommand } from '../../lib/command-handler.js';
import { theAkialytes } from '../../private/config.js';

export const messageCreate = async (message: Message) => {
	const { content, channel, author } = message;

	if (content.startsWith(PREFIX)) handleCommand(message);

	// Auto-Publish any messages posted in Announcement channels that ping the @Streamies role
	if (channel.type === 'GUILD_NEWS' && content.includes(roleMention(theAkialytes.roles['Streamies'].id))) {
		await message.crosspost();
	}

	// React to Akia's message with akiaBonque if she says 'sorry' anywhere in her message
	if (content.search(/[Ss]+[Oo]+[Rr]+[Yy]+/g) !== -1 && author.id === theAkialytes.owner.id) {
		await message.react(theAkialytes.emotes['akiaBonque']);
		await message.reply({ content: `NO SORRY ${theAkialytes.emotes.akiaBonque}` });
	}

	// React to anyone's message with ARSON if they say 'arson' anywhere in their message
	if (content.search(/^[a]+[r]+[s]+[o]+[n]+/gmi) !== -1) {
		await message.react('<a:ARSON:946465803157536819>');
	}
};
