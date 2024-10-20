import { CommandHandler } from '@commands/command.js';
import { displayName, getRandomIntegerFromSeed } from '@lib/utilities.js';
import { Canvas, Image, SKRSContext2D, createCanvas, loadImage } from '@napi-rs/canvas';
import { AttachmentBuilder, ChatInputCommandInteraction } from 'discord.js';

export class ReadingCommandHandler extends CommandHandler {
  private canvas: Canvas;
  private canvasContext: SKRSContext2D;
  private todayIsCursedDay: boolean;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.canvas = createCanvas(1343, 720);
    this.canvasContext = this.canvas.getContext('2d');

    // Thursday is Cursed Day!!! Changes stars to black and inverts colours.
    this.todayIsCursedDay = new Date().getDay() === 4;
  }

  async handle() {
    await this.interaction.deferReply();

    const cursed = this.todayIsCursedDay ? 'cursed ' : '';
    const attachment = await this.createUserReadingImage();
    const userName = displayName(this.interaction);

    await this.interaction.editReply({ content: `## Here is your ${cursed}reading for ${new Date().toDateString()}, ${userName}...`, files: [attachment] });
  }

  private fetchStarDrawOrder(starReading: number, starCount: number) {
    const fullStarCount = Math.floor(starReading);
    const halfStarCount = starReading % 1 >= 0.5 ? 1 : 0;
    const emptyStarCount = starCount - fullStarCount - halfStarCount;

    return `${'full,'.repeat(fullStarCount)}${'half,'.repeat(halfStarCount)}${'empty,'.repeat(emptyStarCount)}`.split(',').slice(0, -1);
  }

  private async drawStars(starReading: number, x: number, y: number, starSize: number) {
    const cursed = this.todayIsCursedDay ? 'cursed-' : '';

    const fullStarImage = await loadImage(`assets/reading/${cursed}star-filled.png`);
    const halfStarImage = await loadImage(`assets/reading/${cursed}star-half.png`);
    const emptyStarImage = await loadImage(`assets/reading/${cursed}star-empty.png`);

    const drawOrder = this.fetchStarDrawOrder(starReading, 5);
    const pixelsBetweenStars = 5;

    drawOrder.forEach((star, index) => {
      let starImage: Image;
      if (star === 'full') starImage = fullStarImage;
      else if (star === 'half') starImage = halfStarImage;
      else starImage = emptyStarImage;

      const starX = x + index * (starSize + pixelsBetweenStars);

      this.canvasContext.drawImage(starImage, starX, y, starSize, starSize);
    });
  }

  private async drawAvatar() {
    const cursed = this.todayIsCursedDay ? 'cursed-' : '';

    const response = await fetch(this.interaction.user.displayAvatarURL({ extension: 'png', size: 1024 }))
      .catch(() => fetch('assets/reading/avatar-error.png'));
    const avatar = await loadImage(await response.arrayBuffer());
    const avatarX = 517;
    const avatarY = 97;
    const avatarSize = 310;
    const avatarRadius = avatarSize / 2;

    this.canvasContext.save();

    this.canvasContext.beginPath();
    this.canvasContext.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
    this.canvasContext.closePath();
    this.canvasContext.clip();

    this.canvasContext.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

    this.canvasContext.restore();

    const avatarRing = await loadImage(`assets/reading/${cursed}avatar-ring.png`);
    this.canvasContext.drawImage(avatarRing, 0, 0, this.canvas.width, this.canvas.height);
  }

  private generateStarReading() {
    const seed = `${this.interaction.user.id}${new Date().toDateString()}`;

    const love = getRandomIntegerFromSeed(`${seed}love`, 0, 10) / 2;
    const success = getRandomIntegerFromSeed(`${seed}success`, 0, 10) / 2;
    const luck = getRandomIntegerFromSeed(`${seed}luck`, 0, 10) / 2;
    const wealth = getRandomIntegerFromSeed(`${seed}wealth`, 0, 10) / 2;
    const overall = Math.round((love + success + luck + wealth) / 4 * 2) / 2; // Rounded to nearest 0.5

    return { love, success, luck, wealth, overall };
  }

  private async initialiseCanvas() {
    const cursed = this.todayIsCursedDay ? 'cursed-' : '';

    const backgroundImage = await loadImage(`assets/reading/${cursed}reading.png`);
    this.canvasContext.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
  }

  private async createUserReadingImage() {
    const cursed = this.todayIsCursedDay ? 'cursed ' : '';
    const cMod = this.todayIsCursedDay ? -1 : 1;
    await this.initialiseCanvas();

    const readings = this.generateStarReading();
    await this.drawStars(readings.love, 73, 170, 65);
    await this.drawStars(readings.success, 926, 170, 65);
    await this.drawStars(readings.luck, 73, 359, 65);
    await this.drawStars(readings.wealth, 926, 359, 65);
    await this.drawStars(readings.overall, 438, 615, 90);
    await this.drawAvatar();

    const imageAltText = `Your ${cursed}reading is ${readings.overall * cMod} stars overall, with ${readings.love * cMod} stars for love, ${readings.success * cMod} stars for success, ${readings.luck * cMod} stars for luck, and ${readings.wealth * cMod} stars for wealth.`;
    const attachment = new AttachmentBuilder(await this.canvas.encode('jpeg'), { name: 'reading.jpeg', description: imageAltText });
    return attachment;
  }
}
