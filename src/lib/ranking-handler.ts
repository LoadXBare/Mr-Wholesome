import { Chance } from "chance";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, TextChannel } from "discord.js";
import { levelNotifButtonData } from "./api.js";
import { ChannelIDs, EmbedColours, database, xpCooldownCache } from "./config.js";
import { displayName, styleLog } from "./utilities.js";

export default class RankingHandler {
  message: Message;

  constructor(message: Message) {
    this.message = message;
  }

  handle() {
    this.#handleRanking();
  }

  async #handleRanking() {
    const channelGivesXP = await this.#channelGivesXP();
    const userOnCooldown = this.#userOnCooldown();
    if (!channelGivesXP || userOnCooldown) return;

    const memberRank = await this.#fetchMemberRankFromDatabase();
    if (!memberRank) return;

    const xpPerMessage = { min: 5, max: 15 };
    const currentXP = memberRank.xp;
    const chance = new Chance();
    const xp = currentXP + chance.integer(xpPerMessage);

    const currentLevel = memberRank.xpLevel;
    const levelNotifs = memberRank.levelNotifs;
    const memberLevelledUp = xpRequiredForLevel(currentLevel + 1) <= xp;
    const xpLevel = memberLevelledUp ? currentLevel + 1 : currentLevel;

    if (memberLevelledUp) this.#handleLevelUp(xpLevel, levelNotifs);

    await this.#updateMemberRankInDatabase(xp, xpLevel);
    xpCooldownCache[this.message.author.id] = this.message.createdTimestamp;
  }

  #userOnCooldown() {
    const timeOfLastMessage = xpCooldownCache[this.message.author.id] ?? 0;
    const timeDifference = Date.now() - timeOfLastMessage;
    const cooldown = 30_000; // 30 seconds
    const userOnCooldown = timeDifference < cooldown;

    return userOnCooldown;
  }

  async #handleLevelUp(level: number, levelNotifs: boolean) {
    const levelUpNotifChannel = this.message.guild?.channels.resolve(ChannelIDs.LevelUp);
    if (!(levelUpNotifChannel instanceof TextChannel)) return;

    const content = levelNotifs ? `${this.message.author}` : undefined;
    const embedDescription = [
      '# LEVEL UP!',
      `**${displayName(this.message)}** has levelled up to **Level ${level}**!`,
      '',
      'For more information, use the `/rank` command.',
    ].join('\n');
    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setThumbnail(this.message.author.displayAvatarURL())
      .setColor(EmbedColours.Positive);

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
  async #channelGivesXP() {
    const guildID = this.message.guildId;
    if (!guildID) return false;

    const guildConfig = await database.guildConfig.upsert({
      where: { guildID },
      create: { guildID },
      update: {},
    });
    if (!guildConfig) return styleLog('Error fetching from GUILDCONFIG table!', false, 'ranking-handler.js');

    const rankedIgnoredChannelIDs = guildConfig?.rankedIgnoredChannelIDs.split(',') ?? [];
    return !rankedIgnoredChannelIDs.includes(this.message.channelId);
  }

  async #fetchMemberRankFromDatabase() {
    const guildID = this.message.guildId!; // Bot cannot receive DMs
    const userID = this.message.author.id;

    const memberRank = await database.rank.upsert({
      where: { userID_guildID: { guildID, userID } },
      create: { guildID, userID },
      update: {},
    });
    if (!memberRank) return styleLog('Error while upserting the RANK table!', false, 'ranking-handler.js');

    return memberRank;
  }

  async #updateMemberRankInDatabase(xp: number, xpLevel: number) {
    const guildID = this.message.guildId!; // Bot cannot receive DMs
    const userID = this.message.author.id;

    const memberRank = await database.rank.update({
      where: { userID_guildID: { guildID, userID, } },
      data: { xp, xpLevel },
    });
    if (!memberRank) return styleLog('Error while updating the RANK table!', false, 'ranking-handler.js');

    return memberRank;
  }
}

export function xpRequiredForLevel(level: number) {
  return Math.round(level * 1500); // 1500XP per level
}
