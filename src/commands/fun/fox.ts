import { CommandHandler } from '../command.js';

export class FoxCommandHandler extends CommandHandler {
  async handle() {
    if (!this.checkChannelEligibility(true, true)) return this.postChannelIneligibleMessage(true);
    await this.interaction.deferReply();

    const response = await fetch('https://randomfox.ca/floof/').catch(() => null);

    if (!response) {
      return this.handleError('Error fetching fox image from API.', true, 'fox.js');
    }

    const responseJSON = await response.json();
    const foxURL = responseJSON.image;

    await this.interaction.editReply(foxURL);
  }
}
