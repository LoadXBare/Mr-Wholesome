import { ticketPanelModalData } from "@lib/api.js";
import { database } from "@lib/config.js";
import { ModalHandler } from "@modals/handler.js";
import { stripIndents } from "common-tags";
import { chatInputApplicationCommandMention, Colors, EmbedBuilder, ModalSubmitInteraction } from "discord.js";

export class TicketPanelModalHandler extends ModalHandler {
  private title: string;
  private description: string;
  private ticketDesription: string;

  constructor(interaction: ModalSubmitInteraction) {
    super(interaction);
    this.title = interaction.fields.getTextInputValue('title') || 'Support Tickets';
    this.description = interaction.fields.getTextInputValue('description') || 'Need help? Create a ticket using the button below!';
    this.ticketDesription = interaction.fields.getTextInputValue('ticket-description') || 'Welcome! Please describe your issue below.';
  }

  async handle() {
    const [, id] = this.interaction.customId.split(':');

    const ticketPanelData = await ticketPanelModalData.get(id);
    if (!ticketPanelData) return this.handleError('Ticket panel data cannot be found. Please try again.');
    await ticketPanelModalData.del(id);

    const panelEmbed = new EmbedBuilder()
      .setTitle(this.title)
      .setDescription(this.description)
      .setColor(Colors.Blue);
    const panelEmbedJSON = JSON.stringify(panelEmbed);

    const ticketEmbed = new EmbedBuilder()
      .setDescription(this.ticketDesription)
      .setColor(Colors.Blue);
    const ticketEmbedJSON = JSON.stringify(ticketEmbed);

    const { categoryID, moderatorRoleID, name } = ticketPanelData;
    const guildID = this.guild.id;
    const timeCreated = Date.now().toString();
    await database.ticketPanel.create({ data: { categoryID, guildID, moderatorRoleID, name, panelEmbedJSON, ticketEmbedJSON, timeCreated } });

    const content = stripIndents`✅ Ticket panel "${ticketPanelData.name}" created successfully.
    You can use ${chatInputApplicationCommandMention('ticket-panel', 'post', '1260499767906275369')} to post this panel in a channel.
    
    A preview of the panel and ticket are shown below:`;
    await this.interaction.reply({ content, embeds: [panelEmbed, ticketEmbed] });
  }
}
