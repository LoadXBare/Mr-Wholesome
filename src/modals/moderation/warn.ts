import { stripIndents } from "common-tags";
import { ActionRowBuilder, bold, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, heading, italic, Message, ModalSubmitInteraction, User } from "discord.js";
import { warnModalData } from "../../lib/api.js";
import { baseEmbed, database, EmbedColours } from "../../lib/config.js";
import { ModalHandler } from "../handler.js";

export class WarningModalHandler extends ModalHandler {
  private reason: string;

  constructor(interaction: ModalSubmitInteraction) {
    super(interaction);
    this.reason = interaction.fields.getTextInputValue('reason') || 'No reason provided.';
  }

  async handle(): Promise<void> {
    await this.interaction.deferReply();
    const [, id] = this.interaction.customId.split(':');

    const warningData = await warnModalData.get(id);
    if (!warningData) return this.handleError('Warning data cannot be found. Please try again.');
    await warnModalData.del(id);

    const user = await this.interaction.client.users.fetch(warningData.userID).catch(() => { });
    if (!user) return this.handleError(`User of ID ${bold(warningData.userID)} not found. Please try again.`);

    const confirmationEmbed = new EmbedBuilder(baseEmbed)
      .setTitle(`You're About To Warn ${user.displayName}`)
      .setDescription(stripIndents`
          Doing so **${warningData.notify_user ? 'will notify' : 'will not notify'}** them, if possible.
          
          # Reason
          ${this.reason}`);

    const confirmationButtons = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder()
          .setCustomId('yes')
          .setLabel(`Warn ${user.displayName}`)
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
      .setTitle('Warning Cancelled')
      .setDescription('No input detected after 30 seconds, warning has been cancelled.')
      .setColor(EmbedColours.Negative);
    if (!confirmation) {
      this.interaction.editReply({ embeds: [confirmationEmbed], components: [] });
      return;
    }

    confirmationEmbed
      .setDescription('Warning has been cancelled by user.')
      .setColor(EmbedColours.Neutral);
    if (confirmation.customId === 'no') {
      this.interaction.editReply({ embeds: [confirmationEmbed], components: [] });
      return;
    }

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

    await this.interaction.editReply({ embeds: [embed], components: [] });
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
