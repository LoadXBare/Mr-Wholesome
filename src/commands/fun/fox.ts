import { Command } from '@commands/command.js';

export class FoxCommandHandler extends Command {
  async handle() {
    await this.interaction.deferReply();

    const response = await fetch('https://randomfox.ca/floof/');
    const responseJSON = await response.json();
    const foxURL = responseJSON.image;

    await this.interaction.editReply(foxURL);
  }
}
