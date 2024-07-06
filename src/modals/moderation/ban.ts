import { client } from "@base";
import { banModalData } from "@lib/api.js";
import { database } from "@lib/config.js";
import { ModalHandler } from "@modals/handler.js";
import { bold, EmbedBuilder, heading, italic, ModalSubmitInteraction, User } from "discord.js";

export default class BanModalHandler extends ModalHandler {
  reason: string;

  constructor(interaction: ModalSubmitInteraction) {
    super(interaction);
    this.reason = interaction.fields.getTextInputValue('reason') || 'No reason provided.';

    this.#handleBan();
  }

  async #handleBan() {
    const [, id] = this.interaction.customId.split(':');

    const banData = await banModalData.get(id);
    if (!banData) return this.handleError('Ban data cannot be found. Please try again.');
    await banModalData.del(id);

    const user = await client.users.fetch(banData.userID).catch(() => { });
    if (!user) return this.handleError(`User of ID ${bold(banData.userID)} not found. Please try again.`);

    let notified = false;
    if (banData.notify_user) {
      const content = [
        heading(`Banned from ${this.interaction.guild!.name}`),
        this.reason
      ].join('\n');

      notified = await this.messageUser(user, content, 'Red');
    }

    const banned = await this.interaction.guild!.members.ban(user, { deleteMessageSeconds: banData.delete_messages, reason: this.reason }).then(() => true).catch(() => false);
    if (!banned) return this.handleError(`An error occurred whilst trying to ban ${user.username}. Please try again.`);

    const embedDescription = [
      `✅ ${user.username} has been${notified ? ' notified and' : ''} banned from the server.`,
    ];
    if (!notified && banData.notify_user) embedDescription.push('', italic('⚠️ User has DMs disabled, unable to notify.'));

    const recorded = await this.#addBanToDatabase(user);
    if (!recorded) embedDescription.push('', italic('⚠️ An error occurred whilst adding the ban to the database.'));

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor('Green');

    await this.interaction.reply({ embeds: [embed] });
  }

  // == Database Methods ==
  async #addBanToDatabase(user: User) {
    const result = await database.ban.create({
      data: {
        authorID: this.interaction.user.id,
        bannedID: user.id,
        date: Date.now().toString(),
        reason: this.reason,
        guildID: this.interaction.guildId!,
      }
    }).then(() => true).catch(() => false);

    return result;
  }
}
