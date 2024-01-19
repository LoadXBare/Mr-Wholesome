import { ChatInputCommandInteraction } from 'discord.js';

export default class CatCommand {
  interaction: ChatInputCommandInteraction;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
  }

  handle() {
    this.#postRandomCat();
  }

  async #postRandomCat() {
    await this.interaction.deferReply();

    const response = await fetch('https://api.thecatapi.com/v1/images/search');
    const responseJSON = await response.json() as Array<{ id: string, url: string, width: number, height: number; }>;
    const catURL = responseJSON.at(0)?.url ?? 'Could not fetch URL :(';

    await this.interaction.editReply(catURL);
  }
}
