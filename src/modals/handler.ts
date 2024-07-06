import { EmbedColours } from "@lib/config.js";
import { ColorResolvable, EmbedBuilder, ModalSubmitInteraction, User } from "discord.js";

export class ModalHandler {
  interaction: ModalSubmitInteraction;

  constructor(interaction: ModalSubmitInteraction) {
    this.interaction = interaction;
  }

  async handleError(errorString: string) {
    const errorEmbed = new EmbedBuilder()
      .setDescription(`❌ ${errorString}`)
      .setColor(EmbedColours.Negative);

    if (this.interaction.replied) await this.interaction.editReply({ embeds: [errorEmbed] });
    else await this.interaction.reply({ embeds: [errorEmbed] });
  }

  async messageUser(user: User, content: string, colour: ColorResolvable) {
    const messageEmbed = new EmbedBuilder()
      .setDescription(content)
      .setTimestamp()
      .setColor(colour);

    const messaged = await user.send({ embeds: [messageEmbed] }).then(() => true).catch(() => false);
    return messaged;
  }
}
