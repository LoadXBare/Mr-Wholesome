import { stripIndents } from "common-tags";
import { ActionRowBuilder, bold, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, heading, italic, Message, ModalSubmitInteraction, User } from "discord.js";
import { banModalData } from "../../lib/api.js";
import { baseEmbed, database, EmbedColours } from "../../lib/config.js";
import { ModalHandler } from "../handler.js";

export class BanModalHandler extends ModalHandler {
  private reason: string;

  constructor(interaction: ModalSubmitInteraction) {
    super(interaction);
    this.reason = interaction.fields.getTextInputValue('reason') || 'No reason provided.';
  }

  async handle() {
    await this.interaction.deferReply();
    const [, id] = this.interaction.customId.split(':');

    const banData = await banModalData.get(id);
    if (!banData) return this.handleError('Ban data cannot be found. Please try again.');
    await banModalData.del(id);

    const user = await this.interaction.client.users.fetch(banData.userID).catch(() => { });
    if (!user) return this.handleError(`User of ID ${bold(banData.userID)} not found. Please try again.`);

    const guildBans = await this.guild.bans.fetch();
    if (guildBans.has(user.id)) return this.handleError(`**${user.displayName}** is already banned.`);

    const member = await this.guild.members.fetch(user).catch(() => { });
    if (member && !member.bannable) return this.handleError(`**${user.displayName}** is not considered bannable. This is likely permission related.`);

    let deleteMessageLength = '';

    if (banData.delete_messages === 0) deleteMessageLength = 'none';
    else if (banData.delete_messages === 60 * 60) deleteMessageLength = 'the Previous Hour';
    else if (banData.delete_messages === 6 * 60 * 60) deleteMessageLength = 'the Previous 6 Hours';
    else if (banData.delete_messages === 12 * 60 * 60) deleteMessageLength = 'the Previous 12 Hours';
    else if (banData.delete_messages === 24 * 60 * 60) deleteMessageLength = 'the Previous 24 Hours';
    else if (banData.delete_messages === 3 * 24 * 60 * 60) deleteMessageLength = 'the Previous 3 Days';
    else if (banData.delete_messages === 7 * 24 * 60 * 60) deleteMessageLength = 'the Previous 7 Days';
    else deleteMessageLength = `${banData.delete_messages}`;

    const confirmationEmbed = new EmbedBuilder(baseEmbed)
      .setTitle(`You're About To Ban ${user.displayName}`)
      .setDescription(stripIndents`
      Doing so **${banData.notify_user ? 'will notify' : 'will not notify'}** them, if possible.
      It will also delete **${deleteMessageLength}** of their message history.
      
      # Reason
      ${this.reason}`);

    const confirmationButtons = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder()
          .setCustomId('yes')
          .setLabel(`Ban ${user.displayName}`)
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('no')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary)
      );

    const message = await this.interaction.editReply({ embeds: [confirmationEmbed], components: [confirmationButtons] });
    const filter = (i: ButtonInteraction) => i.user.id === this.interaction.user.id;

    const confirmation = await message.awaitMessageComponent({ filter, componentType: ComponentType.Button, time: 30_000 }).catch(() => { });

    confirmationEmbed
      .setTitle('Ban Cancelled')
      .setDescription('No input detected after 30 seconds, ban has been cancelled.')
      .setColor(EmbedColours.Negative);
    if (!confirmation) {
      this.interaction.editReply({ embeds: [confirmationEmbed], components: [] });
      return;
    }

    confirmationEmbed
      .setDescription('Ban has been cancelled by user.')
      .setColor(EmbedColours.Neutral);
    if (confirmation.customId === 'no') {
      this.interaction.editReply({ embeds: [confirmationEmbed], components: [] });
      return;
    }

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

    const embed = new EmbedBuilder(baseEmbed)
      .setDescription(embedDescription.join('\n'));

    await this.interaction.editReply({ embeds: [embed], components: [] });
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
