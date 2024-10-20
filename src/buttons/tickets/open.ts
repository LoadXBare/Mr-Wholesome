import { ButtonHandler } from "@buttons/button-handler.js";
import { database } from "@lib/config.js";
import { PermissionOverwriteOptions, TextChannel } from "discord.js";

export class openTicketButtonHandler extends ButtonHandler {
  async handle() {
    await this.interaction.deferReply();
    const timeCreated = this.interaction.customId.split(':')[2];
    const ticket = await database.ticket.findUnique({ where: { timeCreated } });

    if (!ticket) {
      return this.handleError('Error fetching ticket from TICKET table.', true, 'open-ticket.js');
    }

    if (ticket.open) {
      return this.handleError('This ticket is already open.');
    }

    const ticketChannel = this.interaction.channel as TextChannel; // Button is only available in ticket channel, so it's safe to cast to TextChannel
    const addedUsers: string[] = JSON.parse(ticket.addedUsers);

    const permissionOverwrites: PermissionOverwriteOptions = {
      AttachFiles: true,
      SendMessages: true,
      ReadMessageHistory: true,
      ViewChannel: true
    };
    for (const addedUser of addedUsers) {
      await ticketChannel.permissionOverwrites.create(addedUser, permissionOverwrites);
    }
    await ticketChannel.permissionOverwrites.create(ticket.authorID, permissionOverwrites);
    await ticketChannel.setName(`❌${ticketChannel.name.substring(1)}`);
    const ticketUpdated = await database.ticket.update({ where: { timeCreated }, data: { open: true } });

    if (!ticketUpdated) {
      return this.handleError('Error updating ticket in TICKET table!', true, 'open-ticket.js');
    }

    await this.interaction.editReply({ content: 'Ticket opened.' });
  }
}
