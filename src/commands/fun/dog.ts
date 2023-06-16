import { ChatInputCommandInteraction } from "discord.js";

export default class DogCommand {
  interaction: ChatInputCommandInteraction;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
  }

  handle() {
    this.#postRandomDog();
  }

  async #postRandomDog() {
    await this.interaction.deferReply();

    const response = await fetch('https://api.thedogapi.com/v1/images/search');
    const responseJSON = await response.json() as Array<{ id: string, url: string, width: number, height: number; }>;
    const dogURL = responseJSON.at(0)?.url ?? 'Could not fetch URL :(';

    await this.interaction.editReply(dogURL);
  }
}
