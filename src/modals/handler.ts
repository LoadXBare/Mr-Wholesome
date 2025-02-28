import { ColorResolvable, EmbedBuilder, ModalSubmitInteraction, User } from "discord.js";
import { BaseInteractionHandler, EmbedColours } from "../lib/config.js";

export abstract class ModalHandler extends BaseInteractionHandler {
  protected interaction: ModalSubmitInteraction;

  constructor(interaction: ModalSubmitInteraction) {
    super(interaction);
    this.interaction = interaction;
  }

  abstract handle(): Promise<void>;

  protected async handleError(errorString: string) {
    const errorEmbed = new EmbedBuilder()
      .setDescription(`❌ ${errorString}`)
      .setColor(EmbedColours.Negative);

    if (this.interaction.replied) await this.interaction.editReply({ embeds: [errorEmbed] });
    else await this.interaction.reply({ embeds: [errorEmbed] });
  }

  protected async messageUser(user: User, content: string, colour: ColorResolvable) {
    const messageEmbed = new EmbedBuilder()
      .setDescription(content)
      .setTimestamp()
      .setColor(colour);

    const message = await user.send({ embeds: [messageEmbed] }).catch(() => false);
    return message;
  }
}
