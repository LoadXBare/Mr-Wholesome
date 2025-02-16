import { ChannelIDs } from 'lib/config.js';
import { CommandHandler } from '../command.js';

export class DogCommandHandler extends CommandHandler {
  async handle() {
    const allowedChannelIDs = [ChannelIDs.BotSpam, ChannelIDs.ComfyVibes];
    if (!this.checkChannelEligibility(allowedChannelIDs)) return this.postChannelIneligibleMessage(allowedChannelIDs);
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
