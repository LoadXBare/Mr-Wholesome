import { ChatInputCommandInteraction } from "discord.js";
import { database } from "../../lib/config.js";
import { CommandHandler } from "../command.js";

export class UnwarnCommandHandler extends CommandHandler {
  private warningID: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.warningID = this.interaction.options.getString('warning_id', true);
  }

  async handle() {
    const warning = await database.warning.findUnique({ where: { date: this.warningID } }).catch(() => null);

    if (!warning) {
      return this.handleError(`**${this.warningID}** is not a valid warning ID!`);
    }

    const warningDeleteSuccessful = await database.warning.delete({ where: { date: this.warningID }, }).catch(() => false).then(() => true);

    if (!warningDeleteSuccessful) {
      return this.handleError('Error deleting warning from WARNING table!', true, 'unwarn.js');
    }

    await this.interaction.reply(`✅ Warning **${this.warningID}** has been removed.`);
  }
}
