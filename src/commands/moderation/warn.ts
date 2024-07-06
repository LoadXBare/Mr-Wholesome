import { warnModalData } from "@lib/api.js";
import { ActionRowBuilder, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";

export default class WarnCommandHandler {
  interaction: ChatInputCommandInteraction;
  user: User;
  notify_user: boolean;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
    this.user = interaction.options.getUser('user', true);
    this.notify_user = interaction.options.getBoolean('notify_user', true);

    this.#displayWarnModal();
  }

  async #displayWarnModal() {
    const warnModal = new ModalBuilder()
      .setCustomId(`warn:${this.interaction.id}`)
      .setTitle(`Warn ${this.user.username}`);

    const reasonTextInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Warning Reason')
      .setPlaceholder('No reason provided.')
      .setRequired(false)
      .setStyle(TextInputStyle.Paragraph);

    const reasonActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reasonTextInput);
    warnModal.addComponents(reasonActionRow);

    await this.interaction.showModal(warnModal);
    await warnModalData.set(this.interaction.id, this.user.id, this.notify_user);
  }
}
