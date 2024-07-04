import { bold, ChatInputCommandInteraction } from "discord.js";
import { database } from "../../../lib/config.js";

export default class WarningRemover {
  interaction: ChatInputCommandInteraction;
  warningID: string;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
    this.warningID = this.interaction.options.getString('warning', true);
  }

  handle() {
    this.removeWarning();
  }

  async removeWarning() {
    const warning = await this.getWarningFromDatabase();
    if (!warning) {
      await this.interaction.editReply(`\`${this.warningID}\` is not a valid warning ID!`);
      return;
    }

    await this.removeWarningFromDatabase();
    await this.interaction.editReply(`✅ Warning ${bold(this.warningID)} has been removed.`);
  }

  // == Database Methods ==
  async getWarningFromDatabase() {
    const date = this.warningID;

    const warning = await database.warning.findUnique({
      where: { date },
    });

    return warning;
  }

  async removeWarningFromDatabase() {
    const date = this.warningID;

    await database.warning.delete({
      where: { date },
    });
  }
}
