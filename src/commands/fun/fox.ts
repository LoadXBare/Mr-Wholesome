import { ChatInputCommandInteraction } from 'discord.js';

export default class FoxCommand {
  interaction: ChatInputCommandInteraction;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
  }

  handle() {
    this.#postRandomFox();
  }

  async #postRandomFox() {
    await this.interaction.deferReply();

    const response = await fetch('https://randomfox.ca/floof/');
    const responseJSON = await response.json() as { image: string, link: string; };
    const foxURL = responseJSON.image;

    await this.interaction.editReply(foxURL);
  }
}
