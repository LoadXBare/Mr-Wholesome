import { ButtonInteraction, Guild } from "discord.js";

export abstract class ButtonHandler {
  protected interaction: ButtonInteraction;
  protected guild: Guild;

  constructor(interaction: ButtonInteraction) {
    this.interaction = interaction;
    this.guild = interaction.guild!;
  }

  abstract handle(): Promise<void>;
}
