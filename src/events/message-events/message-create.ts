import { ChannelType, Message, roleMention } from 'discord.js';
import { BOT_PREFIX } from '../../config/constants.js';
import { handleCommand } from '../../lib/command-handler.js';
import { handleGuildRanking } from '../../lib/guild-ranking/handler.js';
import { handleMemberStats } from '../../lib/member-stats/handler.js';
import { log } from '../../lib/misc/log.js';
import { config } from '../../private/config.js';

export const messageCreate = async (message: Message): Promise<void> => {
	const { content } = message;
	const isGuildNews = message.channel.type === ChannelType.GuildNews;
	const streamiesRolePinged = content.includes(roleMention(config.roles.Streamies));
	const authorIsAkia = message.author.id === config.userIDs.Akialyne;
	const authorIsIchi = message.author.id === config.userIDs.Ichi;
	const messageContainsSorry = content.search(/[s]+[o]+[r]+[y]+/mi) !== -1;
	const messageContainsArson = content.search(/(?<!\S)[a]+[r]+[s]+[o]+[n]+/mi) !== -1;
	const messageContainsKnockKnock = content.search(/([k]+[n]+[o]+[c]+[k]+(.|$)){2}/mi) !== -1;
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
		log(`Published message in channel #${channelName}!`);
	}

	// React to Akia's message with akiaBonque if she says 'sorry' anywhere in her message
	if (authorIsAkia && messageContainsSorry) {
		message.react(config.emotes.akiaBonque);
		message.reply({ content: `NO SORRY ${config.emotes.akiaBonque}` });
		log(`Bonqued Akia for saying sorry in #${channelName}!`);
	}

	// React to anyone's message with ARSON if they say 'arson' anywhere in their message
	if (messageContainsArson) {
		message.react(config.botEmoteIDs.arson);
		log(`Reacted with arson to message by ${message.author.tag} in #${channelName}!`);
	}

	// Reply to Ichi's 'Knock Knock' jokes with 'Come in!' (50% chance)
	if (authorIsIchi && messageContainsKnockKnock) {
		if (Math.round(Math.random()) === 1) {
			message.reply('Come in!');
			log(`Replied to Ichi's Knock Knock joke in #${channelName}!`);
		}
		else {
			message.react('😶‍🌫️');
			log(`Reacted to Ichi's Knock Knock joke in #${channelName}!`);
		}
	}

	// Handle all things related to Mr Wholesome's Guild Ranking and Member Stats systems
	handleGuildRanking(message);
	handleMemberStats(message);
};
