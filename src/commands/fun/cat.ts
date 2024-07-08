import { Command } from '@commands/command.js';

export class CatCommandHandler extends Command {
  async handle() {
    await this.interaction.deferReply();

    const response = await fetch('https://api.thecatapi.com/v1/images/search');
    const responseJSON = await response.json();
    const catURL = responseJSON.at(0)?.url || 'Could not fetch URL :(';

    await this.interaction.editReply(catURL);
  }
}
