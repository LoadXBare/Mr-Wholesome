import { Command } from "@commands/command.js";
import { ticketPanelModalData } from "@lib/api.js";
import { database } from "@lib/config.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export class TicketPanelCommandHandler extends Command {
  async handle() {
    const subcommand = this.interaction.options.getSubcommand(true);

    if (subcommand === 'create') this.showTicketPanelCreationModal();
    else if (subcommand === 'post') this.postTicketPanel();
  }

  private async showTicketPanelCreationModal() {
    const name = this.interaction.options.getString('name', true);
    const category = this.interaction.options.getChannel('category', true, [ChannelType.GuildCategory]);
    const moderatorRole = this.interaction.options.getRole('moderator-role', true);

    const ticketPanelModal = new ModalBuilder()
      .setCustomId(`ticket-panel:${this.interaction.id}`)
      .setTitle('Ticket Panel');

    const panelTitleTextInput = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Panel Title')
      .setPlaceholder('Support Tickets')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const panelDescriptionTextInput = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Panel Description')
      .setPlaceholder('Need help? Create a ticket using the button below!')
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const ticketDescriptionTextInput = new TextInputBuilder()
      .setCustomId('ticket-description')
      .setLabel('Ticket Description')
      .setPlaceholder('Welcome {user}! Please describe your issue below.')
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const panelTitleActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(panelTitleTextInput);
    const panelDescriptionActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(panelDescriptionTextInput);
    const ticketDescriptionActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(ticketDescriptionTextInput);
    ticketPanelModal.addComponents(panelTitleActionRow, panelDescriptionActionRow, ticketDescriptionActionRow);

    await this.interaction.showModal(ticketPanelModal);
    await ticketPanelModalData.set(this.interaction.id, name, category.id, moderatorRole.id);
  }

  private async postTicketPanel() {
    const name = this.interaction.options.getString('name', true);
    const channel = this.interaction.options.getChannel('channel', true, [ChannelType.GuildText]);

    const ticketPanel = await database.ticketPanel.findUnique({ where: { name_guildID: { name: name, guildID: this.guild.id } } });
    if (!ticketPanel) {
      await this.interaction.reply({ content: 'Ticket panel not found' });
      return;
    }

    const ticketPanelEmbed = JSON.parse(ticketPanel.panelEmbedJSON);

    const createTicketButton = new ButtonBuilder()
      .setCustomId(`ticket:create:${name}`)
      .setLabel('Create Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary);
    const createButtonActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(createTicketButton);

    const posted = await channel.send({ embeds: [ticketPanelEmbed], components: [createButtonActionRow] });
    if (!posted) {
      await this.interaction.reply({ content: 'Failed to post ticket panel' });
      return;
    }

    await this.interaction.reply({ content: `✅ Ticket panel "${name}" posted in ${channel} successfully.` });
  }
}
