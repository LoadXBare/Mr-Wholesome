import { stripIndents } from "common-tags";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, TextChannel } from "discord.js";
import { levelNotifButtonData } from "./api.js";
import { ChannelIDs, baseEmbed, database, xpCooldownCache } from "./config.js";
import { getRandomIntegerFromSeed, styleLog } from "./utilities.js";

export default class RankingHandler {
  message: Message;

  constructor(message: Message) {
    this.message = message;
  }

  handle() {
    this.handleRanking();
  }

  private async handleRanking() {
    const channelGivesXP = await this.channelGivesXP();
    const userOnCooldown = this.userOnCooldown();
    if (!channelGivesXP || userOnCooldown) return;

    const memberRank = await this.fetchMemberRankFromDatabase();
    if (!memberRank) return;

    const currentXP = memberRank.xp;
    const seed = Date.now().toString();
    const xp = currentXP + getRandomIntegerFromSeed(seed, 5, 15);

    const currentLevel = memberRank.xpLevel;
    const levelNotifs = memberRank.levelNotifs;
    const memberLevelledUp = levelAtGivenXP(xp) > currentLevel;
    const xpLevel = levelAtGivenXP(xp);

    if (memberLevelledUp) this.handleLevelUp(xpLevel, levelNotifs);

    await this.updateMemberRankInDatabase(xp, xpLevel);
    xpCooldownCache[this.message.author.id] = this.message.createdTimestamp;
  }

  private userOnCooldown() {
    const timeOfLastMessage = xpCooldownCache[this.message.author.id] ?? 0;
    const timeDifference = Date.now() - timeOfLastMessage;
    const cooldown = 30_000; // 30 seconds
    const userOnCooldown = timeDifference < cooldown;

    return userOnCooldown;
  }

  private async handleLevelUp(level: number, levelNotifs: boolean) {
    const levelUpNotifChannel = await this.message.guild?.channels.fetch(ChannelIDs.LevelUp);
    if (!(levelUpNotifChannel instanceof TextChannel)) return;

    const content = levelNotifs ? `${this.message.author}` : undefined;
    const displayName = this.message.author.displayName;
    const embed = new EmbedBuilder(baseEmbed)
      .setTitle('LEVLE UP!')
      .setDescription(stripIndents
        `**${displayName}** has levelled up to **Level ${level}**!
        
        For more information, use the \`/rank\` command.`
      )
      .setThumbnail(this.message.author.displayAvatarURL());

    const buttonLabel = levelNotifs ? 'Disable Ping' : 'Enable Ping';
    const button = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder()
          .setCustomId('toggle-level-notif')
          .setLabel(buttonLabel)
          .setStyle(ButtonStyle.Secondary)
      );

    const levelUpMessage = await levelUpNotifChannel.send({ content, embeds: [embed], components: [button], allowedMentions: { users: [this.message.author.id] } });
    levelNotifButtonData.set(levelUpMessage.id, this.message.author.id, levelNotifs);
  }

  // == DATABASE METHODS ==
  private async channelGivesXP() {
    const guildID = this.message.guildId;
    if (!guildID) return false;

    const guildConfig = await database.guildConfig.upsert({
      where: { guildID },
      create: { guildID },
      update: {},
    });
    if (!guildConfig) return styleLog('Error upserting the GUILDCONFIG table!', false, 'ranking-handler.js');

    const rankedIgnoredChannelIDs = guildConfig?.rankedIgnoredChannelIDs.split(',') ?? [];
    return !rankedIgnoredChannelIDs.includes(this.message.channelId);
  }

  private async fetchMemberRankFromDatabase() {
    const guildID = this.message.guildId!; // Bot cannot receive DMs
    const userID = this.message.author.id;

    const memberRank = await database.rank.upsert({
      where: { userID_guildID: { guildID, userID } },
      create: { guildID, userID },
      update: {},
    });
    if (!memberRank) return styleLog('Error upserting the RANK table!', false, 'ranking-handler.js');

    return memberRank;
  }

  private async updateMemberRankInDatabase(xp: number, xpLevel: number) {
    const guildID = this.message.guildId!; // Bot cannot receive DMs
    const userID = this.message.author.id;

    const memberRank = await database.rank.update({
      where: { userID_guildID: { guildID, userID, } },
      data: { xp, xpLevel },
    });
    if (!memberRank) return styleLog('Error updating the RANK table!', false, 'ranking-handler.js');

    return memberRank;
  }
}

export function xpRequiredForLevel(level: number) {
  return Math.round(Math.pow(level, 1.75) * 200);
}

export function levelAtGivenXP(xp: number) {
  return Math.floor(Math.pow(xp / 200, 1 / 1.75));
}
