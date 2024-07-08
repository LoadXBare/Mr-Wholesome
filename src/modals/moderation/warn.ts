import { client } from "@base";
import { warnModalData } from "@lib/api.js";
import { database, EmbedColours } from "@lib/config.js";
import { ModalHandler } from "@modals/handler.js";
import { bold, EmbedBuilder, heading, italic, ModalSubmitInteraction, User } from "discord.js";

export class WarningModalHandler extends ModalHandler {
  private reason: string;

  constructor(interaction: ModalSubmitInteraction) {
    super(interaction);
    this.reason = interaction.fields.getTextInputValue('reason') || 'No reason provided.';
  }

  async handle(): Promise<void> {
    const [, id] = this.interaction.customId.split(':');
    console.log(id);

    const warningData = await warnModalData.get(id);
    if (!warningData) return this.handleError('Warning data cannot be found. Please try again.');
    await warnModalData.del(id);

    const user = await client.users.fetch(warningData.userID).catch(() => { });
    if (!user) return this.handleError(`User of ID ${bold(warningData.userID)} not found. Please try again.`);

    let notified = false;
    if (warningData.notify_user) {
      const content = [
        heading(`Warned in ${this.guild.name}`),
        this.reason
      ].join('\n');

      notified = await this.messageUser(user, content, 'Yellow');
    }

    const embedDescription = [
      `✅ ${user.username} has been${notified ? ' notified and' : ''} warned in the server.`,
    ];
    if (!notified && warningData.notify_user) embedDescription.push('', italic('⚠️ User has DMs disabled, unable to notify.'));

    const recorded = await this.addWarnToDatabase(user);
    if (!recorded) embedDescription.push('', italic('⚠️ An error occurred whilst adding the warning to the database.'));

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor(EmbedColours.Positive);

    await this.interaction.reply({ embeds: [embed] });
  }

  // == Database Methods ==
  private async addWarnToDatabase(user: User) {
    const authorID = this.interaction.user.id;
    const date = Date.now().toString();
    const guildID = this.guild.id;
    const warnedID = user.id;
    const reason = this.reason;

    const result = await database.warning.create({ data: { authorID, date, guildID, reason, warnedID } });
    return result ? true : false;
  }
}
