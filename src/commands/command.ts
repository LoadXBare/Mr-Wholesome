import { BaseInteractionHandler } from "@lib/config.js";
import { ChatInputCommandInteraction } from "discord.js";

export abstract class CommandHandler extends BaseInteractionHandler {
  protected interaction: ChatInputCommandInteraction;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.interaction = interaction;
  }
}
