import { Command } from "@commands/command.js";
import { database } from "@lib/config.js";
import { ChatInputCommandInteraction, PermissionOverwriteOptions, TextChannel, User } from "discord.js";

export class TicketCommandHandler extends Command {
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
    const channel = this.interaction.channel as TextChannel;
    const ticket = await database.ticket.findUnique({ where: { channelID: channel.id } });
    if (!ticket) {
      await this.interaction.editReply({ content: 'This is not a ticket channel' });
      return;
    }

    const addedUsers: string[] = JSON.parse(ticket.addedUsers);
    if (addedUsers.includes(this.user.id)) {
      await this.interaction.editReply({ content: 'User is already added to the ticket' });
      return;
    }

    addedUsers.push(this.user.id);
    const permissionOverwrites: PermissionOverwriteOptions = { AttachFiles: true, SendMessages: true, ReadMessageHistory: true, ViewChannel: true };
    await channel.permissionOverwrites.create(this.user.id, permissionOverwrites);
    await database.ticket.update({ where: { channelID: channel.id }, data: { addedUsers: JSON.stringify(addedUsers) } });
    await this.interaction.editReply({ content: `"${this.user.username}" added to the ticket` });
  }

  private async removeUser() {
    await this.interaction.deferReply({ ephemeral: true });
    const channel = this.interaction.channel as TextChannel;
    const ticket = await database.ticket.findUnique({ where: { channelID: channel.id } });
    if (!ticket) {
      await this.interaction.editReply({ content: 'This is not a ticket channel' });
      return;
    }

    const addedUsers: string[] = JSON.parse(ticket.addedUsers);
    if (!addedUsers.includes(this.user.id)) {
      await this.interaction.editReply({ content: 'User is not added to the ticket' });
      return;
    }

    const permissionOverwrites = channel.permissionOverwrites.resolve(this.user.id);
    if (permissionOverwrites) await permissionOverwrites.delete();
    addedUsers.splice(addedUsers.indexOf(this.user.id), 1);
    await database.ticket.update({ where: { channelID: channel.id }, data: { addedUsers: JSON.stringify(addedUsers) } });
    await this.interaction.editReply({ content: `"${this.user.username}" removed from the ticket` });
  }
}
