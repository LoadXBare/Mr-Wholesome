import {
  Canvas, Image, SKRSContext2D, createCanvas, loadImage,
} from '@napi-rs/canvas';
import { Chance } from 'chance';
import { AttachmentBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { request } from 'undici';

export default class ReadingCommand {
  interaction: ChatInputCommandInteraction;

  canvas: Canvas;

  canvasContext: SKRSContext2D;

  todayIsCursedDay: boolean;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;

    this.canvas = createCanvas(1343, 720);
    this.canvasContext = this.canvas.getContext('2d');

    // Thursday is Cursed Day!!! Changes stars to black and inverts colours.
    this.todayIsCursedDay = new Date().getDay() === 4;
  }

  handle() {
    this.#postUserReading();
  }

  async #postUserReading() {
    await this.interaction.deferReply();

    const cursed = this.todayIsCursedDay ? 'cursed ' : '';
    const attachment = await this.#createUserReadingImage();
    const userName = this.interaction.member instanceof GuildMember ? this.interaction.member.displayName : this.interaction.user.username;

    await this.interaction.editReply({ content: `## Here is your ${cursed}reading for ${new Date().toDateString()}, ${userName}...`, files: [attachment] });
  }

  #fetchStarDrawOrder(starReading: number, starCount: number) {
    const fullStarCount = Math.floor(starReading);
    const halfStarCount = starReading % 1 >= 0.5 ? 1 : 0;
    const emptyStarCount = starCount - fullStarCount - halfStarCount;

    return `${'full,'.repeat(fullStarCount)}${'half,'.repeat(halfStarCount)}${'empty,'.repeat(emptyStarCount)}`.split(',').slice(0, -1);
  }

  async #drawStars(starReading: number, x: number, y: number, starSize: number) {
    const cursed = this.todayIsCursedDay ? 'cursed-' : '';

    const fullStarImage = await loadImage(`assets/reading/${cursed}star-filled.png`);
    const halfStarImage = await loadImage(`assets/reading/${cursed}star-half.png`);
    const emptyStarImage = await loadImage(`assets/reading/${cursed}star-empty.png`);

    const drawOrder = this.#fetchStarDrawOrder(starReading, 5);
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

  async #drawAvatar() {
    const cursed = this.todayIsCursedDay ? 'cursed-' : '';

    const { body } = await request(this.interaction.user.displayAvatarURL({ extension: 'png' }));
    const avatar = await loadImage(await body.arrayBuffer());
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
    this.canvasContext.drawImage(avatarRing, avatarX, avatarY, avatarSize, avatarSize);
  }

  #generateStarReading() {
    const seed = `${this.interaction.user.id} ${new Date().toDateString()}`;
    const chance = new Chance(seed);

    const love = chance.natural({ min: 1, max: 10 }) / 2;
    const success = chance.natural({ min: 1, max: 10 }) / 2;
    const luck = chance.natural({ min: 1, max: 10 }) / 2;
    const wealth = chance.natural({ min: 1, max: 10 }) / 2;
    const overall = Math.round((love + success + luck + wealth) / 4 * 2) / 2; // Rounded to nearest 0.5

    return {
      love, success, luck, wealth, overall,
    };
  }

  async #initialiseCanvas() {
    const cursed = this.todayIsCursedDay ? 'cursed-' : '';

    const backgroundImage = await loadImage(`assets/reading/${cursed}reading.png`);
    this.canvasContext.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
  }

  async #createUserReadingImage() {
    const cursed = this.todayIsCursedDay ? 'cursed ' : '';
    const cMod = this.todayIsCursedDay ? -1 : 1;
    await this.#initialiseCanvas();

    const readings = this.#generateStarReading();
    await this.#drawStars(readings.love, 73, 170, 65);
    await this.#drawStars(readings.success, 926, 170, 65);
    await this.#drawStars(readings.luck, 73, 359, 65);
    await this.#drawStars(readings.wealth, 926, 359, 65);
    await this.#drawStars(readings.overall, 438, 615, 90);
    await this.#drawAvatar();

    const imageAltText = `Your ${cursed}reading is ${readings.overall * cMod} stars overall, with ${readings.love * cMod} stars for love, ${readings.success * cMod} stars for success, ${readings.luck * cMod} stars for luck, and ${readings.wealth * cMod} stars for wealth.`;

    const attachment = new AttachmentBuilder(await this.canvas.encode('png'), { name: 'reading.png', description: imageAltText });
    return attachment;
  }
}
