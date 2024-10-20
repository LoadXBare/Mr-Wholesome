import { EmbedColours } from "@lib/config.js";
import { ColorResolvable, EmbedBuilder, Guild, ModalSubmitInteraction, User } from "discord.js";

export abstract class ModalHandler {
  protected interaction: ModalSubmitInteraction;
  protected guild: Guild;

  constructor(interaction: ModalSubmitInteraction) {
    this.interaction = interaction;
    this.guild = interaction.guild!;
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
