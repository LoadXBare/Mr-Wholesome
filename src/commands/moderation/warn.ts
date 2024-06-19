import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, User } from 'discord.js';
import client from '../../index.js';
import { EmbedColours, database } from '../../lib/config.js';

export default class WarnCommand {
  interaction: ChatInputCommandInteraction;
  command: string;
  userString: string;
  user: User | void | undefined;
  reason: string;
  dm: boolean;
  warningID: string;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
    this.command = interaction.options.getSubcommand(true);
    this.userString = this.interaction.options.getString('user') ?? 'undefined';
    this.reason = this.interaction.options.getString('reason') ?? 'undefined';
    this.dm = this.interaction.options.getBoolean('dm') ?? false;
    this.warningID = this.interaction.options.getString('warning') ?? 'undefined';
  }

  async handle() {
    this.user = await client.users.fetch(this.userString.replaceAll(/\D/gm, '')).catch(() => { }); // Cannot relay on .resolve() as user may not be in guild

    if (this.command === 'add') this.#handleAddWarning();
    else if (this.command === 'view') this.#handleViewWarnings();
  }

  async #handleAddWarning() {
    await this.interaction.deferReply();

    if (!(this.user instanceof User)) {
      await this.interaction.editReply(`\`${this.userString}\` is not a valid @user or user ID!`);
      return;
    }

    // Slash commands don't have native multi-line support (still) so manually
    // adding "\n" to option strings and then formatting those as newlines is
    // the only way to currently do it.
    this.reason = this.reason.split('\\n').map((v) => v.trim()).join('\n');

    const embedDescription = [
      '## Warn',
      'You\'re about to warn a user, is everything correct?',
      `### User — ${this.user}`,
      `### DM User? — ${this.dm ? 'Yes' : 'No'}`,
      '### Reason',
      this.reason,
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setColor('Purple');

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('yes')
        .setLabel(`Yes, warn @${this.user.username}`)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('no')
        .setLabel('No, cancel warning')
        .setStyle(ButtonStyle.Danger),
    );

    await this.interaction.editReply({ embeds: [embed], components: [buttons] });
    this.#awaitAddWarningButtonInteraction();
  }

  async #awaitAddWarningButtonInteraction() {
    const IDLE_TIMEOUT_SECONDS = 3_000;
    const filter = (i: ButtonInteraction) => {
      i.deferUpdate();
      return i.user.id === this.interaction.user.id;
    };

    const buttonInteraction = await this.interaction.channel?.awaitMessageComponent({ componentType: ComponentType.Button, filter, time: IDLE_TIMEOUT_SECONDS }).catch(() => { });
    if (buttonInteraction === undefined || buttonInteraction.customId === 'no') return this.#cancelWarning();

    this.#addWarning();
  }

  async #addWarning() {
    if (!(this.user instanceof User)) return;
    await this.#addWarningToDatabase();

    const embedDescription = [
      '## Warning Added',
      `Successfully warned ${this.user}!`,
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setFooter({ text: `@${this.user.username} was not notified` })
      .setColor('Green');

    if (this.dm) {
      const successful = await this.#messageWarnedUser();

      if (successful) {
        embed.setFooter({ text: `@${this.user.username} was notified` });
      } else {
        embed.setFooter({ text: `@${this.user.username} was not notified • An error occurred (DMs closed?)` });
        embed.setColor('Yellow');
      }
    }

    await this.interaction.editReply({ embeds: [embed], components: [] });
  }

  async #messageWarnedUser() {
    if (!(this.user instanceof User)) return;

    const warningEmbedDescription = [
      '## Warning',
      `You have received a warning from **${this.interaction.guild}**`,
      '### Reason',
      this.reason,
    ].join('\n');

    const warningEmbed = new EmbedBuilder()
      .setDescription(warningEmbedDescription)
      .setTimestamp()
      .setColor(EmbedColours.Negative);

    const successful = await this.user.send({ embeds: [warningEmbed] }).catch(() => { });
    return successful !== undefined;
  }

  async #cancelWarning() {
    const embedDescription = [
      '## Warning Cancelled',
      `Warning creation was either cancelled by @${this.interaction.user.username} or timed out.`,
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setColor('Grey');

    await this.interaction.editReply({ embeds: [embed], components: [] });
  }

  async #handleViewWarnings() {
    await this.interaction.deferReply();

    if (this.user instanceof User) this.#viewUserWarnings();
    else if (this.warningID !== 'undefined') this.#viewWarningDetails();
    else this.#viewAllGuildWarnings();
  }

  async #viewAllGuildWarnings() {
    const guildWarnings = await this.#fetchGuildWarningsFromDatabase();

    const userWarningCount: { [key: string]: number; } = {};
    const warnedUserPromises: Array<Promise<User>> = [];
    guildWarnings.forEach((warning) => {
      if (userWarningCount[warning.warnedID] === undefined) {
        warnedUserPromises.push(client.users.fetch(warning.warnedID));
      }

      userWarningCount[warning.warnedID] = (userWarningCount[warning.warnedID] ?? 0) + 1;
    });

    const warnedUsers = (await Promise.allSettled(warnedUserPromises)).map((user) => (user.status === 'fulfilled' ? user.value : undefined));

    const warningsList: Array<string> = [];
    warnedUsers.forEach((user) => {
      if (user !== undefined) {
        warningsList.push(
          `- **@${user.username}** — ${userWarningCount[user.id]} warnings\
          \n - **User ID** — \`${user.id}\``,
        );
      }
    });

    const embedDescription = [
      `## Displaying warnings for \`${this.interaction.guild}\``,
      `### Found ${warningsList.length} users with warnings`,
      warningsList.join('\n'),
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setColor('Purple');

    await this.interaction.editReply({ embeds: [embed] });
  }

  async #viewUserWarnings() {
    if (!(this.user instanceof User)) {
      await this.interaction.editReply(`\`${this.userString}\` is not a valid @user or user ID!`);
      return;
    }

    const userWarnings = await this.#fetchUserWarningsFromDatabase();

    const warningsList: Array<string> = [];
    userWarnings.forEach((warning, index) => {
      warningsList.push(`- **#${index + 1}** — \`${warning.warningID}\``);
    });

    const embedDescription = [
      `## Displaying warnings for \`@${this.user.username}\``,
      `### Found ${warningsList.length} warnings`,
      warningsList.join('\n'),
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setColor('Purple');

    await this.interaction.editReply({ embeds: [embed] });
  }

  async #viewWarningDetails() {
    const warning = await this.#fetchWarningFromDatabase();

    if (warning === null) {
      await this.interaction.editReply(`\`${this.warningID}\` is not a valid warning ID!`);
      return;
    }

    const [guild, author, warnedUser] = await Promise.allSettled([
      client.guilds.fetch(warning.guildID),
      client.users.fetch(warning.authorID),
      client.users.fetch(warning.warnedID),
    ]);
    const guildName = guild.status === 'fulfilled' ? guild.value.name : 'N/A';
    const authorUsername = author.status === 'fulfilled' ? author.value.username : 'N/A';
    const warnedUsername = warnedUser.status === 'fulfilled' ? warnedUser.value.username : 'N/A';

    const embedDescription = [
      `## Viewing warning \`${this.warningID}\``,
      `### Guild — ${guildName}`,
      `### Author — @${authorUsername}`,
      `### Warned User — @${warnedUsername}`,
      '### Reason',
      warning.reason,
    ].join('\n');

    const button = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('delete')
        .setLabel('Delete Warning')
        .setStyle(ButtonStyle.Danger),
    );

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setFooter({ text: `Warned on ${new Date(Number(warning.date)).toUTCString()}` })
      .setColor('Purple');

    await this.interaction.editReply({ embeds: [embed], components: [button] });
    this.#awaitDeleteWarningButtonInteraction();
  }

  async #awaitDeleteWarningButtonInteraction() {
    const IDLE_TIMEOUT_SECONDS = 30_000;
    const filter = (i: ButtonInteraction) => {
      i.deferUpdate();
      return i.user.id === this.interaction.user.id;
    };

    const buttonInteraction = await this.interaction.channel?.awaitMessageComponent({ componentType: ComponentType.Button, filter, time: IDLE_TIMEOUT_SECONDS }).catch(() => { });
    if (buttonInteraction === undefined) return this.#removeDeleteWarningButton();

    this.#deleteWarning();
  }

  async #deleteWarning() {
    const result = await this.#deleteWarningFromDatabase();

    const embedDescription = [
      '## Warning Deleted',
      `Successfully deleted warning with ID \`${result.warningID}\`!`,
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setColor('Green');

    await this.interaction.editReply({ embeds: [embed], components: [] });
  }

  async #removeDeleteWarningButton() {
    await this.interaction.editReply({ components: [] });
  }

  // == Database Methods ==
  async #addWarningToDatabase() {
    const result = await database.warning.create({
      data: {
        authorID: this.interaction.user.id,
        date: Date.now(),
        guildID: this.interaction.guildId ?? '',
        reason: this.reason,
        warnedID: this.user?.id ?? '',
      },
    });

    return result;
  }

  async #deleteWarningFromDatabase() {
    const result = await database.warning.delete({
      where: { warningID: this.warningID },
    });

    return result;
  }

  async #fetchGuildWarningsFromDatabase() {
    const result = await database.warning.findMany({
      where: { guildID: this.interaction.guildId ?? '' },
    });

    return result;
  }

  async #fetchUserWarningsFromDatabase() {
    const result = await database.warning.findMany({
      where: {
        guildID: this.interaction.guildId ?? '',
        warnedID: this.user?.id ?? '',
      },
    });

    return result;
  }

  async #fetchWarningFromDatabase() {
    const result = await database.warning.findUnique({
      where: { warningID: this.warningID },
    });

    return result;
  }
}
