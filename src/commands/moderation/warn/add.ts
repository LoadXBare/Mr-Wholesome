import { client } from "@base";
import { database } from "@lib/config.js";
import { ActionRowBuilder, bold, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, codeBlock, ComponentType, EmbedBuilder, heading, inlineCode, italic, time, User } from "discord.js";

export default class WarningAdder {
  interaction: ChatInputCommandInteraction;
  warnedUserString: string;
  reason: string;
  notifyWarnedUser: boolean;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
    this.warnedUserString = this.interaction.options.getString('user', true).replace(/[^0-9]/g, '');
    this.notifyWarnedUser = this.interaction.options.getBoolean('dm', true);

    this.reason = this.interaction.options.getString('reason', true);
    this.reason = this.reason.split('\\n').map((v) => v.trim()).join('\n'); // add multi-line support using "\n"
  }

  async handle() {
    await this.addWarning();
  }

  async addWarning() {
    const warnedUser = await client.users.fetch(this.warnedUserString).catch(() => { });
    if (!warnedUser) {
      await this.interaction.editReply(`${inlineCode(this.warnedUserString)} is not a valid @User or User ID!`);
      return;
    }

    const confirmWarningDescription = [
      heading(`Warning ${warnedUser.username}`),
      `You're about to warn ${bold(warnedUser.username)}, is everything correct?`,
      `- ${bold('DM User?')} — ${this.notifyWarnedUser ? inlineCode('✅') : inlineCode('❌')}`,
      codeBlock(this.reason),
    ].join('\n');

    const confirmWarningEmbed = new EmbedBuilder()
      .setDescription(confirmWarningDescription)
      .setColor('Purple');

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('yes')
        .setLabel(`Yes, warn ${warnedUser.username}`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('no')
        .setLabel('No, cancel warning')
        .setStyle(ButtonStyle.Danger),
    );

    await this.interaction.editReply({ embeds: [confirmWarningEmbed], components: [buttons] });

    const warningConfirmed = await this.buttonConfirmation();
    if (!warningConfirmed) return this.cancelWarning();

    const notified = await this.messageWarnedUser(warnedUser);

    const embedDescription = [
      `✅ ${warnedUser.username} has been warned${notified ? ' and notified' : ''}!`
    ];
    if (!notified && this.notifyWarnedUser) embedDescription.push('', italic('⚠️ User has DMs disabled, unable to notify.'));

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor('Green');

    await this.interaction.editReply({ embeds: [embed], components: [] });
    await this.addWarningToDatabase(warnedUser);
  }

  async buttonConfirmation() {
    const filter = (i: ButtonInteraction) => {
      i.deferUpdate();
      return i.user.id === this.interaction.user.id;
    };

    const buttonInteraction = await this.interaction.channel!.awaitMessageComponent({ componentType: ComponentType.Button, filter, time: 15_000 }).catch(() => { });

    if (!buttonInteraction || buttonInteraction.customId === 'no') return false;
    else return true;
  }

  async cancelWarning() {
    const embed = new EmbedBuilder()
      .setDescription('❌ Warning cancelled.')
      .setColor('Red');

    await this.interaction.editReply({ embeds: [embed], components: [] });
  }

  async messageWarnedUser(user: User) {
    if (!this.notifyWarnedUser) return false;

    const content = [
      heading(`Warning from ${this.interaction.guild!.name}`),
      bold(time(new Date(), 'R')),
      codeBlock(this.reason)
    ].join('\n');

    const notified = await user.send(content).then(() => true).catch(() => false);
    return notified;
  }

  // == Database Methods ==
  async addWarningToDatabase(user: User) {
    await database.warning.create({
      data: {
        authorID: this.interaction.user.id,
        date: Date.now().toString(),
        guildID: this.interaction.guildId!,
        reason: this.reason,
        warnedID: user.id
      }
    });
  }
}
