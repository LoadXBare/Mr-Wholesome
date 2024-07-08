import { Command } from "@commands/command.js";
import { database } from "@lib/config.js";
import { bold, ChatInputCommandInteraction } from "discord.js";

export class UnwarnCommandHandler extends Command {
  private warningID: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.warningID = this.interaction.options.getString('warning_id', true);
  }

  async handle() {
    const warning = await this.getWarningFromDatabase();
    if (!warning) {
      await this.interaction.reply(`${bold(this.warningID)} is not a valid warning ID!`);
      return;
    }

    await this.removeWarningFromDatabase();
    await this.interaction.reply(`✅ Warning ${bold(this.warningID)} has been removed.`);
  }

  // == Database Methods ==
  private async getWarningFromDatabase() {
    const date = this.warningID;

    const warning = await database.warning.findUnique({ where: { date }, });
    return warning;
  }

  private async removeWarningFromDatabase() {
    const date = this.warningID;

    await database.warning.delete({ where: { date }, });
  }
}
