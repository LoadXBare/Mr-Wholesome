import { Command } from '@commands/command.js';

export class DogCommandHandler extends Command {
  async handle() {
    await this.interaction.deferReply();

    const response = await fetch('https://api.thedogapi.com/v1/images/search');
    const responseJSON = await response.json();
    const dogURL = responseJSON.at(0)?.url || 'Could not fetch URL :(';

    await this.interaction.editReply(dogURL);
  }
}
