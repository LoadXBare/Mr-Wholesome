import { client } from "@base";
import { database } from "@lib/config.js";
import { bold, ChatInputCommandInteraction } from "discord.js";

export class UnbanCommandHandler {
  interaction: ChatInputCommandInteraction;
  userID: string;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
    this.userID = interaction.options.getString('user_id', true);

    this.#unbanUser();
  }

  async #unbanUser() {
    const user = await client.users.fetch(this.userID).catch(() => { });
    if (!user) {
      await this.interaction.reply(`${bold(this.userID)} is not a valid User ID!`);
      return;
    }

    const userIsBanned = await this.interaction.guild!.bans.fetch(user).catch(() => { });
    if (!userIsBanned) {
      await this.interaction.reply(`${bold(user.username)} is not banned!`);
      return;
    }

    const unbanned = await this.interaction.guild!.bans.remove(user);
    if (!unbanned) {
      await this.interaction.reply(`Failed to unban ${bold(user.username)}!`);
      return;
    }

    await this.#updateBanInDatabase();
    await this.interaction.reply(`✅ ${bold(user.username)} has been unbanned.`);
  }

  // == Database Methods ==
  async #updateBanInDatabase() {
    const date = this.userID;

    await database.ban.update({ where: { date }, data: { unbanned: true } });
  }
}