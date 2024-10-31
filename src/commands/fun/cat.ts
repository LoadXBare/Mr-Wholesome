import { CommandHandler } from '../command.js';

export class CatCommandHandler extends CommandHandler {
  async handle() {
    if (!this.checkChannelEligibility(true, true)) return this.postChannelIneligibleMessage(true);
    await this.interaction.deferReply();

    const response = await fetch('https://api.thecatapi.com/v1/images/search').catch(() => null);

    if (!response) {
      return this.handleError('Error fetching cat image from API.', true, 'cat.js');
    }

    const responseJSON = await response.json();
    const catURL = responseJSON.at(0).url;

    await this.interaction.editReply(catURL);
  }
}
