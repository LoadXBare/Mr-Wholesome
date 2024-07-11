import { ButtonHandler } from "@buttons/button-handler.js";
import { database } from "@lib/config.js";
import { sleep } from "@lib/utilities.js";
import { TextChannel, time } from "discord.js";

export class deleteTicketButtonHandler extends ButtonHandler {
  async handle() {
    const timeCreated = this.interaction.customId.split(':')[2];
    const ticket = await database.ticket.findUnique({ where: { timeCreated } });
    if (!ticket) {
      await this.interaction.reply({ content: 'Ticket not found.' });
      return;
    }

    const ticketChannel = this.interaction.channel as TextChannel;
    const futureDate = new Date(Date.now() + 5000);
    await this.interaction.reply({ content: `Deleting ticket ${time(futureDate, 'R')}...` });
    await sleep(5000);
    await ticketChannel.delete();
    await database.ticket.delete({ where: { timeCreated } });
  }
}
