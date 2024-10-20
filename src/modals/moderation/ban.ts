import { client } from "@base";
import { banModalData } from "@lib/api.js";
import { database } from "@lib/config.js";
import { ModalHandler } from "@modals/handler.js";
import { bold, EmbedBuilder, heading, italic, Message, ModalSubmitInteraction, User } from "discord.js";

export class BanModalHandler extends ModalHandler {
  private reason: string;

  constructor(interaction: ModalSubmitInteraction) {
    super(interaction);
    this.reason = interaction.fields.getTextInputValue('reason') || 'No reason provided.';
  }

  async handle() {
    const [, id] = this.interaction.customId.split(':');

    const banData = await banModalData.get(id);
    if (!banData) return this.handleError('Ban data cannot be found. Please try again.');
    await banModalData.del(id);

    const user = await client.users.fetch(banData.userID).catch(() => { });
    if (!user) return this.handleError(`User of ID ${bold(banData.userID)} not found. Please try again.`);

    let notifiedMessage: Message<false> | boolean = false;
    if (banData.notify_user) {
      const content = [
        heading(`Banned from ${this.guild.name}`),
        this.reason
      ].join('\n');

      notifiedMessage = await this.messageUser(user, content, 'Red');
    }

    const banned = await this.guild.members.ban(user, { deleteMessageSeconds: banData.delete_messages, reason: this.reason }).then(() => true).catch(() => false);
    if (!banned) {
      let editSuccessful = false;
      if (notifiedMessage instanceof Message) {
        const edited = await notifiedMessage.edit({ content: 'An error occurred, please disregard this notification. No action is necessary on your part.', embeds: [] }).catch(() => { });
        if (edited) editSuccessful = true;
      }

      let notificationDeletedMessage = '';
      if (editSuccessful) notificationDeletedMessage = '\nℹ️ The user was notified however the notification was quickly edited.';
      else if (!editSuccessful && notifiedMessage instanceof Message) notificationDeletedMessage = '\n⚠️ The user was notified and the notification could not be edited!';
      return this.handleError(`An error occurred whilst trying to ban ${user.username}. Please try again.${notificationDeletedMessage}`);
    }

    const embedDescription = [
      `✅ ${user.username} has been${notifiedMessage ? ' notified and' : ''} banned from the server.`,
    ];
    if (!notifiedMessage && banData.notify_user) embedDescription.push('', italic('⚠️ User has DMs disabled, unable to notify.'));

    const recorded = await this.addBanToDatabase(user);
    if (!recorded) embedDescription.push('', italic('⚠️ An error occurred whilst adding the ban to the database.'));

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor('Green');

    await this.interaction.reply({ embeds: [embed] });
  }

  // == Database Methods ==
  private async addBanToDatabase(user: User) {
    const result = await database.ban.create({
      data: {
        authorID: this.interaction.user.id,
        bannedID: user.id,
        date: Date.now().toString(),
        reason: this.reason,
        guildID: this.guild.id,
      }
    }).then(() => true).catch(() => false);

    return result;
  }
}
