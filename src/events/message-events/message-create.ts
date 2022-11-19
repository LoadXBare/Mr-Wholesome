import { ChannelType, EmbedBuilder, ForumChannel, GuildForumTag, Message, roleMention, ThreadChannel } from 'discord.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { handleCommand } from '../../lib/command-handler.js';
import { handleGuildRanking } from '../../lib/guild-ranking/handler.js';
import { handleMemberStats } from '../../lib/member-stats/handler.js';
import { isModerator } from '../../lib/misc/check-moderator.js';
import { log } from '../../lib/misc/log.js';
import { sleep } from '../../lib/misc/sleep.js';
import { config } from '../../private/config.js';

const threadChannelHasModPostTag = (forumChannel: ForumChannel, threadChannel: ThreadChannel): boolean => {
	const foundTags: Array<GuildForumTag> = [];
	for (const tag of threadChannel.appliedTags) {
		foundTags.push(forumChannel.availableTags.find(forumTag => forumTag.id === tag));
	}
	for (const tag of foundTags) {
		if (tag.name === 'Mod Post') {
			return true;
		}
	}
	return false;
};

export const messageCreate = async (message: Message): Promise<void> => {
	const { content } = message;
	const isGuildNews = message.channel.type === ChannelType.GuildAnnouncement;
	const authorIsAkia = message.author.id === config.userIDs.Akialyne;
	const authorIsIchi = message.author.id === config.userIDs.Ichi;
	const messageContainsSorry = content.search(/[s]+[o]+[r]+[y]+/mi) !== -1;
	const messageContainsArson = content.search(/(?<!\S)[a]+[r]+[s]+[o]+[n]+/mi) !== -1;
	const messageContainsKnockKnock = content.search(/([k]+[n]+[o]+[c]+[k]+(.|$)){2}/mi) !== -1;
	const messageEndsWithPain = content.search(/\bpain\W{0,}$/i) !== -1;
	const channelName = message.channel.type === ChannelType.DM ? message.author.username : message.channel.name;
	const channelIsMemes = message.channelId === config.channelIDs.memes;
	const isThreadChannel = message.channel.isThread();

	if (message.author.bot) {
		return;
	}

	if (content.startsWith(BOT_PREFIX)) {
		handleCommand(message);
		return;
	}

	// Auto-Publish any messages posted in Announcement channels
	if (isGuildNews) {
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

	// Reply to Ichi's 'Knock Knock' jokes with various responses
	if (authorIsIchi && messageContainsKnockKnock) {
		const randomNumber = Math.ceil(Math.random() * 3);
		if (randomNumber === 1) {
			message.reply('Come in!');
			log(`Replied to Ichi's Knock Knock joke in #${channelName}!`);
		}
		else if (randomNumber === 2) {
			message.reply('Get off my property!');
			log(`Replied to Ichi's Knock Knock joke in #${channelName}!`);
		}
		else {
			message.react('😶‍🌫️');
			log(`Reacted to Ichi's Knock Knock joke in #${channelName}!`);
		}
	}

	// Reply with 'au chocolat?' if a message ends with the word 'pain'
	if (messageEndsWithPain && channelIsMemes) {
		message.reply('au chocolat?');
		log(`Replied to message ending in "pain" in #${channelName}!`);
	}

	if (isThreadChannel) {
		const isInForumChannel = message.channel.parent.type === ChannelType.GuildForum;

		if (isInForumChannel) {
			const forumChannel = message.channel.parent as ForumChannel;

			const threadIsModPost = threadChannelHasModPostTag(forumChannel, message.channel);
			const authorIsMod = isModerator(message.member);

			if (threadIsModPost && !authorIsMod) {
				const invalidPermissionsEmbed = new EmbedBuilder()
					.setAuthor({ name: 'Error', iconURL: config.botEmoteUrls.error })
					.setDescription(`You must have the ${roleMention(config.roles.Mods)} role to post in forum channels with the "${config.emotes.akiaBonque} Mod Post" tag!`)
					.setColor(COLORS.FAIL);

				const reply = await message.reply({ embeds: [invalidPermissionsEmbed] });
				await message.delete();
				await sleep(5000);
				await reply.delete();
			}
		}
	}

	// Handle all things related to Mr Wholesome's Guild Ranking and Member Stats systems
	handleGuildRanking(message);
	handleMemberStats(message);
};
