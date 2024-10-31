import { ActionRowBuilder, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, User, UserContextMenuCommandInteraction } from "discord.js";
import { banModalData } from "../../lib/api.js";
import { CommandHandler } from "../command.js";

export class BanCommandHandler extends CommandHandler {
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

export class ContextMenuBanCommandHandler {
  private interaction: UserContextMenuCommandInteraction;
  private targetUser: User;

  constructor(interaction: UserContextMenuCommandInteraction) {
    this.interaction = interaction;
    this.targetUser = interaction.targetUser;
  }

  async handle() {
    const banModal = new ModalBuilder()
      .setCustomId(`ban:${this.interaction.id}`)
      .setTitle(`Ban ${this.targetUser.username}`);

    const reasonTextInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Ban Reason')
      .setPlaceholder('No reason provided.')
      .setRequired(false)
      .setStyle(TextInputStyle.Paragraph);

    const reasonActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(reasonTextInput);
    banModal.addComponents(reasonActionRow);

    await this.interaction.showModal(banModal);
    await banModalData.set(this.interaction.id, this.targetUser.id, 7 * 24 * 60 * 60, true);
  }
}
