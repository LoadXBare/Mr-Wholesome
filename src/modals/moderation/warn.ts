import { warnModalData } from "@lib/api.js";
import { baseEmbed, database } from "@lib/config.js";
import { ModalHandler } from "@modals/handler.js";
import { bold, EmbedBuilder, heading, italic, Message, ModalSubmitInteraction, User } from "discord.js";

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

    const user = await this.interaction.client.users.fetch(warningData.userID).catch(() => { });
    if (!user) return this.handleError(`User of ID ${bold(warningData.userID)} not found. Please try again.`);

    let notifiedMessage: Message<false> | boolean = false;
    if (warningData.notify_user) {
      const content = [
        heading(`Warned in ${this.guild.name}`),
        this.reason
      ].join('\n');

      notifiedMessage = await this.messageUser(user, content, 'Yellow');
    }

    const embedDescription = [
      `✅ ${user.username} has been${notifiedMessage ? ' notified and' : ''} warned in the server.`,
    ];
    if (!notifiedMessage && warningData.notify_user) embedDescription.push('', italic('⚠️ User has DMs disabled, unable to notify.'));

    const recorded = await this.addWarnToDatabase(user);
    if (!recorded) embedDescription.push('', italic('⚠️ An error occurred whilst adding the warning to the database.'));

    const embed = new EmbedBuilder(baseEmbed)
      .setDescription(embedDescription.join('\n'));

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
