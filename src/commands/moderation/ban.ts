import { Command } from "@commands/command.js";
import { banModalData } from "@lib/api.js";
import { ActionRowBuilder, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, User } from "discord.js";

export class BanCommandHandler extends Command {
  private user: User;
  private delete_messages: number;
  private notify_user: boolean;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.user = interaction.options.getUser('user', true);
    this.delete_messages = interaction.options.getInteger('delete_messages', true);
    this.notify_user = interaction.options.getBoolean('notify_user', true);
  }

  async handle() {
    const banModal = new ModalBuilder()
      .setCustomId(`ban:${this.interaction.id}`)
      .setTitle(`Ban ${this.user.username}`);

    const reasonTextInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Ban Reason')
      .setPlaceholder('No reason provided.')
      .setRequired(false)
      .setStyle(TextInputStyle.Paragraph);

    const reasonActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reasonTextInput);
    banModal.addComponents(reasonActionRow);

    await this.interaction.showModal(banModal);
    await banModalData.set(this.interaction.id, this.user.id, this.delete_messages, this.notify_user);
  }
}
