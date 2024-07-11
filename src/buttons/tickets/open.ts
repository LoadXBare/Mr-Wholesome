import { ButtonHandler } from "@buttons/button-handler.js";
import { database } from "@lib/config.js";
import { TextChannel } from "discord.js";

export class openTicketButtonHandler extends ButtonHandler {
  async handle() {
    await this.interaction.deferReply();
    const timeCreated = this.interaction.customId.split(':')[2];
    const ticket = await database.ticket.findUnique({ where: { timeCreated } });
    if (!ticket) {
      await this.interaction.editReply({ content: 'Ticket not found.' });
      return;
    }

    if (ticket.open) {
      await this.interaction.editReply({ content: 'Ticket is already open.' });
      return;
    }

    const ticketChannel = this.interaction.channel as TextChannel;
    const addedUsers: string[] = JSON.parse(ticket.addedUsers);
    for (const addedUser of addedUsers) {
      await ticketChannel.permissionOverwrites.create(addedUser, { AttachFiles: true, SendMessages: true, ReadMessageHistory: true, ViewChannel: true });
    }
    await ticketChannel.permissionOverwrites.create(ticket.authorID, { AttachFiles: true, SendMessages: true, ReadMessageHistory: true, ViewChannel: true });
    await ticketChannel.setName(`❌${ticketChannel.name.substring(1)}`);
    await database.ticket.update({ where: { timeCreated }, data: { open: true } });

    await this.interaction.editReply({ content: 'Ticket opened.' });
  }
}
