import { ChannelType, Message, roleMention } from 'discord.js';
import { BOT_PREFIX } from '../../config/constants.js';
import { handleCommand } from '../../lib/command-handler.js';
import { log } from '../../lib/misc/log.js';
import { config } from '../../private/config.js';

export const messageCreate = (message: Message): void => {
	const { content } = message;
	const isGuildNews = message.channel.type === ChannelType.GuildNews;
	const streamiesRolePinged = content.includes(roleMention(config.roles.Streamies));
	const authorIsAkia = message.author.id === config.theAkialytesOwnerId;
	const messageContainsSorry = content.search(/[s]+[o]+[r]+[y]+/mi) !== -1;
	const messageContainsArson = content.search(/(?<!\S)[a]+[r]+[s]+[o]+[n]+/mi) !== -1;
	const channelName = message.channel.type === ChannelType.DM ? message.author.username : message.channel.name;

	if (message.author.bot) {
		return;
	}

	if (content.startsWith(BOT_PREFIX)) {
		handleCommand(message);
		return;
	}

	// Auto-Publish any messages posted in Announcement channels that ping the @Streamies role
	if (isGuildNews && streamiesRolePinged) {
		message.crosspost();
		log(`Published message in channel ${channelName}!`);
	}

	// React to Akia's message with akiaBonque if she says 'sorry' anywhere in her message
	if (authorIsAkia && messageContainsSorry) {
		message.react(config.emotes.akiaBonque);
		message.reply({ content: `NO SORRY ${config.emotes.akiaBonque}` });
		log('Bonqued Akia for saying sorry!');
	}

	// React to anyone's message with ARSON if they say 'arson' anywhere in their message
	if (messageContainsArson) {
		message.react(config.botEmotes.arson);
		log(`Reacted with arson to message by ${message.author.tag} in ${channelName}!`);
	}
};
