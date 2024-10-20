import { client } from "@base";
import { CommandHandler } from "@commands/command.js";
import { database } from "@lib/config.js";
import { ChatInputCommandInteraction } from "discord.js";

export class UnbanCommandHandler extends CommandHandler {
  private userID: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.userID = interaction.options.getString('user_id', true);
  }

  async handle() {
    const user = await client.users.fetch(this.userID).catch(() => null);

    if (!user) {
      return this.handleError(`**${this.userID}** is not a valid User ID!`);
    }

    const userIsBanned = await this.guild.bans.fetch(user).catch(() => null);

    if (!userIsBanned) {
      return this.handleError(`**${user.username}** is not banned!`);
    }

    const unbanned = await this.guild.bans.remove(user).catch(() => false).then(() => true);

    if (!unbanned) {
      return this.handleError('Failed to unban user.', true, 'unban.js');
    }

    const banUpdateSuccessful = await database.ban.update({
      where: { date: this.userID },
      data: { unbanned: true }
    }).catch(() => false).then(() => true);

    if (!banUpdateSuccessful) {
      return this.handleError('Error updating ban in BAN table!', true, 'unban.js');
    }

    await this.interaction.reply(`✅ **${user.username}** has been unbanned.`);
  }
}
