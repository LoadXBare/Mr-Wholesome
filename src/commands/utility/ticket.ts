import { CommandHandler } from "@commands/command.js";
import { database } from "@lib/config.js";
import { ChatInputCommandInteraction, PermissionOverwriteOptions, TextChannel, User } from "discord.js";

export class TicketCommandHandler extends CommandHandler {
  user: User;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.user = interaction.options.getUser('user', true);
  }

  async handle() {
    const subcommand = this.interaction.options.getSubcommand(true);

    if (subcommand === 'add_user') await this.addUser();
    else if (subcommand === 'remove_user') await this.removeUser();
  }

  private async addUser() {
    await this.interaction.deferReply({ ephemeral: true });
    const ticket = await database.ticket.findUnique({ where: { channelID: this.interaction.channel!.id } });

    if (!ticket) {
      return this.handleError('You are not in a ticket channel.');
    }

    const channel = this.interaction.channel as TextChannel; // All ticket channels are text channels so this is safe

    const addedUsers: string[] = JSON.parse(ticket.addedUsers);

    if (addedUsers.includes(this.user.id)) {
      return this.handleError('This user is already added to this ticket.');
    }

    addedUsers.push(this.user.id);

    const ticketUpdated = await database.ticket.update({ where: { channelID: channel.id }, data: { addedUsers: JSON.stringify(addedUsers) } }).catch(() => null);

    if (!ticketUpdated) {
      return this.handleError('Failed to update ticket in TICKET table.', true, 'ticket.js');
    }

    const permissionOverwrites: PermissionOverwriteOptions = {
      AttachFiles: true,
      SendMessages: true,
      ReadMessageHistory: true,
      ViewChannel: true
    };
    await channel.permissionOverwrites.create(this.user.id, permissionOverwrites);

    await this.interaction.editReply({ content: `"${this.user.username}" added to the ticket` });
  }

  private async removeUser() {
    await this.interaction.deferReply({ ephemeral: true });
    const ticket = await database.ticket.findUnique({ where: { channelID: this.interaction.channel!.id } }).catch(() => null);

    if (!ticket) {
      return this.handleError('You are not in a ticket channel.');
    }

    const channel = this.interaction.channel as TextChannel; // All ticket channels are text channels so this is safe

    const addedUsers: string[] = JSON.parse(ticket.addedUsers);
    if (!addedUsers.includes(this.user.id)) {
      return this.handleError('This user is not added to this ticket.');
    }

    addedUsers.splice(addedUsers.indexOf(this.user.id), 1);

    const ticketUpdated = await database.ticket.update({ where: { channelID: channel.id }, data: { addedUsers: JSON.stringify(addedUsers) } }).catch(() => null);

    if (!ticketUpdated) {
      return this.handleError('Failed to update ticket in TICKET table.', true, 'ticket.js');
    }

    const permissionOverwrites = channel.permissionOverwrites.resolve(this.user.id);
    if (permissionOverwrites) await permissionOverwrites.delete();
    await this.interaction.editReply({ content: `"${this.user.username}" removed from the ticket` });
  }
}
