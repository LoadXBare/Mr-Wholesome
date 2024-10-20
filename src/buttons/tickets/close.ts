import { ButtonHandler } from "@buttons/button-handler.js";
import { database, EmbedColours } from "@lib/config.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";

export class closeTicketButtonHandler extends ButtonHandler {
  async handle() {
    await this.interaction.deferReply();
    const timeCreated = this.interaction.customId.split(':')[2];
    const ticket = await database.ticket.findUnique({ where: { timeCreated } });

    if (!ticket) {
      return this.handleError('Error fetching ticket from TICKET table.', true, 'close-ticket.js');
    }

    if (!ticket.open) {
      return this.handleError('This ticket is already closed.');
    }

    const ticketChannel = this.interaction.channel as TextChannel; // Button is only available in ticket channel, so it's safe to cast to TextChannel
    const addedUsers: string[] = JSON.parse(ticket.addedUsers);
    for (const addedUser of addedUsers) {
      await ticketChannel.permissionOverwrites.delete(addedUser);
    }
    await ticketChannel.permissionOverwrites.delete(ticket.authorID);
    await ticketChannel.setName(`✅${ticketChannel.name.substring(1)}`);
    const ticketUpdated = await database.ticket.update({
      where: { timeCreated },
      data: { open: false }
    }).catch(() => false).then(() => true);

    if (!ticketUpdated) {
      return this.handleError('Error updating ticket in TICKET table!', true, 'close-ticket.js');
    }

    const openTicketButton = new ButtonBuilder()
      .setCustomId(`ticket:open:${timeCreated}`)
      .setLabel('Open Ticket')
      .setEmoji('🔓')
      .setStyle(ButtonStyle.Secondary);
    const deleteTicketButton = new ButtonBuilder()
      .setCustomId(`ticket:delete:${timeCreated}`)
      .setLabel('Delete Ticket')
      .setEmoji('🗑️')
      .setStyle(ButtonStyle.Danger);
    const buttonActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(openTicketButton, deleteTicketButton);

    const embeds = [this.simpleEmbed(`Ticket closed by ${this.interaction.user}.`, EmbedColours.Info)];
    await this.interaction.editReply({ embeds, components: [buttonActionRow] });
  }
}
