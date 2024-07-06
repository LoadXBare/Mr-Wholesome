import { client } from "@base";
import { database } from "@lib/config.js";
import { bold, ChatInputCommandInteraction, codeBlock, EmbedBuilder, heading, inlineCode, time, User } from "discord.js";

export default class WarningViewer {
  interaction: ChatInputCommandInteraction;
  warnedUserString: string;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
    this.warnedUserString = (this.interaction.options.getString('user') ?? '').replace(/[^0-9]/g, '');
  }

  handle() {
    if (this.warnedUserString) this.viewUserWarnings();
    else this.viewGuildWarnings();
  }

  async viewUserWarnings() {
    const warnedUser = await client.users.fetch(this.warnedUserString).catch(() => { });
    if (!warnedUser) {
      await this.interaction.editReply(`${inlineCode(this.warnedUserString)} is not a valid @User or User ID!`);
      return;
    }

    const userWarnings = await this.getUserWarningsFromDatabase(warnedUser);

    const embedDescription: Array<string> = [
      heading(`${userWarnings.length} warning(s) for ${warnedUser.username}`, 2)
    ];
    for (const warning of userWarnings) {
      const author = await client.users.fetch(warning.authorID);
      const date = new Date(Number(warning.date));

      embedDescription.push(
        `${bold(time(date, 'R'))} — Warn ID: ${bold(warning.date)}`,
        `${bold(author.username)} warned ${bold(warnedUser.username)}`,
        codeBlock(warning.reason),
      );
    }

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor('Purple');

    await this.interaction.editReply({ embeds: [embed] });
  }

  async viewGuildWarnings() {
    const guildWarnings = await this.getGuildWarningsFromDatabase();

    const embedDescription: Array<string> = [
      heading(`${guildWarnings.length} warning(s) in ${this.interaction.guild}`, 2)
    ];
    for (const warning of guildWarnings) {
      const author = await client.users.fetch(warning.authorID);
      const warned = await client.users.fetch(warning.warnedID);
      const date = new Date(Number(warning.date));
      const reason = warning.reason.length > 50 ? `${warning.reason.slice(0, 50).trim()}...` : warning.reason;

      embedDescription.push(
        `${bold(time(date, 'R'))} — Warn ID: ${bold(warning.date)}`,
        `${bold(author.username)} warned ${bold(warned.username)} [ID: ${warned.id}]`,
        codeBlock(reason),
      );
    }

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor('Purple');

    await this.interaction.editReply({ embeds: [embed] });
  }

  // == Database Methods ==
  async getUserWarningsFromDatabase(user: User) {
    const warnedID = user.id;
    const guildID = this.interaction.guildId!;

    const result = await database.warning.findMany({
      where: { warnedID, guildID },
      orderBy: { date: 'desc' },
    });

    return result;
  }

  async getGuildWarningsFromDatabase() {
    const guildID = this.interaction.guildId!;

    const result = await database.warning.findMany({
      where: { guildID },
      orderBy: { date: 'desc' },
    });

    return result;
  }
}
