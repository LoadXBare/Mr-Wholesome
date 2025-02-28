import { ButtonInteraction } from "discord.js";
import { BaseInteractionHandler } from "../lib/config.js";

export abstract class ButtonHandler extends BaseInteractionHandler {
  protected interaction: ButtonInteraction;

  constructor(interaction: ButtonInteraction) {
    super(interaction);
    this.interaction = interaction;
  }
}
