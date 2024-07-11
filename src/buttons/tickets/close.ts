import { ButtonHandler } from "@buttons/button-handler.js";
import { database } from "@lib/config.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";

export class closeTicketButtonHandler extends ButtonHandler {
  async handle() {
    await this.interaction.deferReply();
    const timeCreated = this.interaction.customId.split(':')[2];
    const ticket = await database.ticket.findUnique({ where: { timeCreated } });
    if (!ticket) {
      await this.interaction.editReply({ content: 'Ticket not found.' });
      return;
    }

    if (!ticket.open) {
      await this.interaction.editReply({ content: 'Ticket is already closed.' });
      return;
    }

    const ticketChannel = this.interaction.channel as TextChannel;
    const addedUsers: string[] = JSON.parse(ticket.addedUsers);
    for (const addedUser of addedUsers) {
      await ticketChannel.permissionOverwrites.delete(addedUser);
    }
    await ticketChannel.permissionOverwrites.delete(ticket.authorID);
    await ticketChannel.setName(`✅${ticketChannel.name.substring(1)}`);
    await database.ticket.update({ where: { timeCreated }, data: { open: false } });

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

    await this.interaction.editReply({ content: 'Ticket closed.', components: [buttonActionRow] });
  }
}
