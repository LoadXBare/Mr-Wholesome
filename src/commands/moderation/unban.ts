import { client } from "@base";
import { Command } from "@commands/command.js";
import { database } from "@lib/config.js";
import { bold, ChatInputCommandInteraction } from "discord.js";

export class UnbanCommandHandler extends Command {
  private userID: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.userID = interaction.options.getString('user_id', true);
  }

  async handle() {
    const user = await client.users.fetch(this.userID).catch(() => { });
    if (!user) {
      await this.interaction.reply(`${bold(this.userID)} is not a valid User ID!`);
      return;
    }

    const userIsBanned = await this.guild.bans.fetch(user).catch(() => { });
    if (!userIsBanned) {
      await this.interaction.reply(`${bold(user.username)} is not banned!`);
      return;
    }

    const unbanned = await this.guild.bans.remove(user);
    if (!unbanned) {
      await this.interaction.reply(`Failed to unban ${bold(user.username)}!`);
      return;
    }

    await this.updateBanInDatabase();
    await this.interaction.reply(`✅ ${bold(user.username)} has been unbanned.`);
  }

  // == Database Methods ==
  private async updateBanInDatabase() {
    const date = this.userID;

    await database.ban.update({ where: { date }, data: { unbanned: true } });
  }
}
