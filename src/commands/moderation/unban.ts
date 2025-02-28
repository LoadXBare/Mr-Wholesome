import { ChatInputCommandInteraction } from "discord.js";
import { database } from "../../lib/config.js";
import { CommandHandler } from "../command.js";

export class UnbanCommandHandler extends CommandHandler {
  private userID: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.userID = interaction.options.getString('user_id', true);
  }

  async handle() {
    const user = await this.interaction.client.users.fetch(this.userID).catch(() => null);
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

    const latestUserBan = await database.ban.findFirst({
      where: {
        bannedID: this.userID,
        guildID: this.guild.id,
        unbanned: false
      }
    }).catch(() => null);

    if (!latestUserBan) {
      return this.handleError('Error fetching ban from BAN table!', true, 'unban.js');
    }

    const banUpdateSuccessful = await database.ban.update({
      where: { date: latestUserBan.date },
      data: { unbanned: true }
    }).catch(() => false).then(() => true);

    if (!banUpdateSuccessful) {
      return this.handleError('Error updating ban in BAN table!', true, 'unban.js');
    }

    await this.interaction.reply(`✅ **${user.username}** has been unbanned.`);
  }
}
