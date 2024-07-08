import { Command } from "@commands/command.js";
import { database } from "@lib/config.js";
import { xpRequiredForLevel } from "@lib/ranking-handler.js";
import { displayName } from "@lib/utilities.js";
import { Canvas, GlobalFonts, SKRSContext2D, loadImage } from "@napi-rs/canvas";
import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";

export class RankCommandHandler extends Command {
  private canvas: Canvas;
  private canvasContext: SKRSContext2D;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);

    GlobalFonts.registerFromPath('assets/fonts/Ubuntu-Medium.ttf', 'ubuntu-medium');
    GlobalFonts.registerFromPath('assets/fonts/TwitterColorEmoji-SVGinOT.ttf', 'twitter-emoji');
    this.canvas = new Canvas(1343, 410);
    this.canvasContext = this.canvas.getContext('2d');
  }

  async handle() {
    await this.interaction.deferReply();

    const userRankImage = await this.createUserRankImage();

    await this.interaction.editReply({ files: [userRankImage] });
  }

  private async intialiseCanvas() {
    const backgroundImage = await loadImage('assets/rank/rank.png');
    this.canvasContext.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
  }

  private async drawAvatar() {
    const response = await fetch(this.interaction.user.displayAvatarURL({ extension: 'png', size: 1024 }));
    const avatar = await loadImage(await response.arrayBuffer());
    const avatarX = 50;
    const avatarY = 50;
    const avatarSize = 310;
    const avatarRadius = avatarSize / 2;

    this.canvasContext.save();

    this.canvasContext.beginPath();
    this.canvasContext.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
    this.canvasContext.closePath();
    this.canvasContext.clip();

    this.canvasContext.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

    this.canvasContext.restore();

    const avatarOutline = await loadImage('assets/rank/avatar-outline.png');
    this.canvasContext.drawImage(avatarOutline, 0, 0, this.canvas.width, this.canvas.height);
  }

  private async drawProgressBar(percent: number, xp: number, xpNeeded: number) {
    const barX = 452;
    const barY = 258;
    const barWidth = 800;
    const barHeight = 72;
    const barRadius = barHeight / 2;
    const pixelsPerPercent = barWidth / 100;

    // Create clipping mask for progress bar
    this.canvasContext.save();
    this.canvasContext.beginPath();
    this.canvasContext.arc(barX + barRadius, barY + barRadius, barRadius, Math.PI / 2, Math.PI * 1.5);
    this.canvasContext.lineTo(barX + barWidth - barRadius, barY);
    this.canvasContext.arc(barX + barWidth - barRadius, barY + barRadius, barRadius, Math.PI * 1.5, Math.PI / 2);
    this.canvasContext.lineTo(barX + barRadius, barY + barHeight);
    this.canvasContext.clip();

    // Draw progress bar
    this.canvasContext.fillStyle = '#66ff99';
    this.canvasContext.fillRect(barX, barY, pixelsPerPercent * percent, barHeight);
    this.canvasContext.restore();

    // Draw progress bar text
    this.canvasContext.font = 'bold 45px ubuntu-medium';
    this.canvasContext.textAlign = 'center';
    this.canvasContext.fillStyle = 'white';
    this.canvasContext.fillText(`${xp} / ${xpNeeded} XP`, barX + barWidth / 2, barY + barHeight / 2 + 15);

    const progressBarOutline = await loadImage('assets/rank/progress-bar-outline.png');
    this.canvasContext.drawImage(progressBarOutline, 0, 0, this.canvas.width, this.canvas.height);
  }

  private async drawRankInfo(level: number) {
    const progressBarX = 452;
    const progressBarY = 258;
    const progressBarWidth = 800;

    const aboveBarX = progressBarX + progressBarWidth / 2;
    const aboveBarY = progressBarY - 20;

    const userPosition = await this.fetchRankPositionFromDatabase();

    const usernameText = displayName(this.interaction);
    const levelText = `Level ${level}`;
    const userPositionText = `Rank #${userPosition}`;

    this.canvasContext.fillStyle = 'white';
    this.canvasContext.textAlign = 'center';
    this.canvasContext.font = 'bold 80px ubuntu-medium, twitter-emoji';
    this.canvasContext.fillText(usernameText, aboveBarX, 100, 900);

    this.canvasContext.font = 'bold 35px ubuntu-medium';
    this.canvasContext.textAlign = 'left';
    this.canvasContext.fillText(userPositionText, progressBarX, aboveBarY);

    this.canvasContext.textAlign = 'right';
    this.canvasContext.fillText(levelText, progressBarX + progressBarWidth, aboveBarY);

  }

  private fetchLevelProgress(xp: number, level: number) {
    const currentLevelTotalXP = xpRequiredForLevel(level);
    const nextLevelTotalXP = xpRequiredForLevel(level + 1);
    const xpNeededForEntireCurrentLevel = nextLevelTotalXP - currentLevelTotalXP;

    const xpIntoLevel = xp - currentLevelTotalXP;
    const xpIntoLevelPercent = Math.round(xpIntoLevel / xpNeededForEntireCurrentLevel * 100);

    return {
      xpNeeded: nextLevelTotalXP,
      percent: xpIntoLevelPercent,
    };
  }

  private async createUserRankImage() {
    const { xp, xpLevel } = await this.fetchMemberRankFromDatabase();
    const { percent, xpNeeded } = this.fetchLevelProgress(xp, xpLevel);

    await this.intialiseCanvas();
    await this.drawAvatar();
    await this.drawProgressBar(percent, xp, xpNeeded);
    await this.drawRankInfo(xpLevel);

    const imageAltText = `You are Level ${xpLevel} with ${xp} XP! ${xpNeeded - xp} XP until Level ${xpLevel + 1}!`;
    const attachment = new AttachmentBuilder(await this.canvas.encode('jpeg'), { name: 'rank.jpeg', description: imageAltText });
    return attachment;
  }

  // == Database Methods ==
  private async fetchMemberRankFromDatabase() {
    const guildID = this.guild.id;
    const userID = this.interaction.user.id;

    const memberRank = await database.rank.upsert({
      where: { userID_guildID: { guildID, userID } },
      create: { guildID, userID },
      update: {},
    });

    return memberRank;
  }

  private async fetchRankPositionFromDatabase() {
    const guildID = this.guild.id;
    const userID = this.interaction.user.id;

    const guildMembers = await this.guild.members.fetch();
    const guildMemberIDs = guildMembers?.map((member) => member.id);

    const guildRanks = await database.rank.findMany({ where: { guildID }, orderBy: { xp: 'desc' } });
    const filteredRanks = guildRanks.filter((rank) => guildMemberIDs?.includes(rank.userID));

    const memberRankPosition = filteredRanks.findIndex((rank) => rank.userID === userID) + 1;
    return memberRankPosition;
  }
}
