import { TextChannel, time } from "discord.js";
import { database } from "../../lib/config.js";
import { sleep } from "../../lib/utilities.js";
import { ButtonHandler } from "../button-handler.js";

export class deleteTicketButtonHandler extends ButtonHandler {
  async handle() {
    const timeCreated = this.interaction.customId.split(':')[2];
    const ticket = await database.ticket.findUnique({ where: { timeCreated } });

    if (!ticket) {
      return this.handleError('Error fetching ticket from TICKET table.', true, 'delete-ticket.js');
    }

    const ticketChannel = this.interaction.channel as TextChannel; // Button is only available in ticket channel, so it's safe to cast to TextChannel
    const futureDate = new Date(Date.now() + 5000);
    await this.interaction.reply({ content: `Deleting ticket ${time(futureDate, 'R')}...` });
    await sleep(5000);

    const ticketDeleteSuccessful = await database.ticket.delete({ where: { timeCreated } }).catch(() => false).then(() => true);

    if (!ticketDeleteSuccessful) {
      return this.handleError('Error deleting ticket from TICKET table!', true, 'delete-ticket.js');
    }

    const channelDeleteSuccessful = await ticketChannel.delete().catch(() => false).then(() => true);

    if (!channelDeleteSuccessful) {
      return this.handleError('Error deleting ticket channel.', true, 'delete-ticket.js');
    }
  }
}
