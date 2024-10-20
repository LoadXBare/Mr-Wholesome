import { BaseInteractionHandler } from "@lib/config.js";
import { ButtonInteraction } from "discord.js";

export abstract class ButtonHandler extends BaseInteractionHandler {
  protected interaction: ButtonInteraction;

  constructor(interaction: ButtonInteraction) {
    super(interaction);
    this.interaction = interaction;
  }
}
