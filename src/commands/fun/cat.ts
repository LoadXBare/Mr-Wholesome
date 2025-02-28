import { ChannelIDs } from '../../lib/config.js';
import { CommandHandler } from '../command.js';

export class CatCommandHandler extends CommandHandler {
  async handle() {
    const allowedChannelIDs = [ChannelIDs.BotSpam, ChannelIDs.ComfyVibes];
    if (!this.checkChannelEligibility(allowedChannelIDs)) return this.postChannelIneligibleMessage(allowedChannelIDs);
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
