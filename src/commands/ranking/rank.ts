import { EmbedBuilder, GuildMember, inlineCode } from 'discord.js';
import { fetchMemberRanking } from '../../api/guild-ranking.js';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command, GuildRanking, XPLevelBounds } from '../../index.js';
import { fetchMemberLeaderboardPosition } from '../../lib/guild-ranking/handler.js';
import { fetchXPLevelBounds } from '../../lib/guild-ranking/xp-level.js';
import { fetchGuildMember } from '../../lib/misc/fetch-guild-member.js';
import { createProgressBar } from '../../lib/misc/progress-bar.js';
import { sendError } from '../../lib/misc/send-error.js';

const checkRankCommand = async (args: BotCommand): Promise<void> => {
	const { commandArgs, message } = args;

	let memberRanking: GuildRanking;
	let xpLevelBounds: XPLevelBounds;
	let memberLeaderboardPos: number;
	let member: GuildMember;
	if (commandArgs.length === 0) {
		member = message.member;
		memberRanking = await fetchMemberRanking(message.guildId, message.author.id);
		xpLevelBounds = fetchXPLevelBounds(memberRanking.xpLevel);
		memberLeaderboardPos = await fetchMemberLeaderboardPosition(member);
	}
	else {
		const memberText = commandArgs.shift() ?? 'undefined';
		const memberID = memberText.replace(/\D/g, '');

		member = await fetchGuildMember(message.guild, memberID);
		if (member === null) {
			sendError(message, `${inlineCode(memberText)} is not a valid User!`);
			return;
		}

		memberRanking = await fetchMemberRanking(message.guildId, member.id);
		xpLevelBounds = fetchXPLevelBounds(memberRanking.xpLevel);
		memberLeaderboardPos = await fetchMemberLeaderboardPosition(member);
	}

	const memberRankEmbed = new EmbedBuilder()
		.setThumbnail(member.displayAvatarURL())
		.setTitle(`Viewing rank card for ${member.user.tag}`)
		.setDescription(`**Level:** ${memberRanking.xpLevel}\
			\n**Rank:** #${memberLeaderboardPos}\
			\n**Total XP:** ${memberRanking.xp}\
			\n\n**Progress:** ${memberRanking.xp - xpLevelBounds.lower} / ${xpLevelBounds.upper - xpLevelBounds.lower} XP\
			\n${createProgressBar(memberRanking.xp - xpLevelBounds.lower, xpLevelBounds.upper - xpLevelBounds.lower, 10, true)}`)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [memberRankEmbed] });
};

export const checkRank: Command = {
	devOnly: false,
	modOnly: false,
	run: checkRankCommand,
	type: 'Ranking'
};
