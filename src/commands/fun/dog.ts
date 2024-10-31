import { CommandHandler } from '../command.js';

export class DogCommandHandler extends CommandHandler {
  async handle() {
    if (!this.checkChannelEligibility(true, true)) return this.postChannelIneligibleMessage(true);
    await this.interaction.deferReply();

    const response = await fetch('https://api.thedogapi.com/v1/images/search').catch(() => null);

    if (!response) {
      return this.handleError('Error fetching dog image from API.', true, 'dog.js');
    }

    const responseJSON = await response.json();
    const dogURL = responseJSON.at(0).url;

    await this.interaction.editReply(dogURL);
  }
}
