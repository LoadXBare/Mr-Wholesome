import { ChatInputCommandInteraction, Guild } from "discord.js";

export abstract class Command {
  protected interaction: ChatInputCommandInteraction;
  protected guild: Guild;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
    this.guild = interaction.guild!;
  }

  abstract handle(): Promise<void>;
}
