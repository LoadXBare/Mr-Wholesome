import { client } from "@base";
import { Command } from "@commands/command.js";
import { database } from "@lib/config.js";
import { Ban, Warning } from "@prisma/client";
import { bold, chatInputApplicationCommandMention, ChatInputCommandInteraction, EmbedBuilder, heading, inlineCode, italic, time, User } from "discord.js";

export class ViewCommandHandler extends Command {
  async handle() {
    const subcommand = this.interaction.options.getSubcommand(true);
    await this.interaction.deferReply();

    if (subcommand === 'ban') new BanViewer(this.interaction).handle();
    else if (subcommand === 'warning') new WarningViewer(this.interaction).handle();
  }
}

class BanViewer extends Command {
  private id: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.id = (interaction.options.getString('id') || '').replace(/[^0-9]/g, '');
  }

  async handle() {
    if (!this.id) return this.viewBans();

    const ban = await this.getBanFromDatabase(this.id);
    const user = await client.users.fetch(this.id).catch(() => { });

    if (ban) this.viewBan(ban);
    else if (user) this.viewBans(user);
    else await this.interaction.editReply(`${inlineCode(this.id)} is not a valid @mention, User ID, or Warning ID!`);
  }

  private async viewBan(ban: Ban) {
    const date = new Date(Number(ban.date));
    const author = await client.users.fetch(ban.authorID);
    const user = await client.users.fetch(ban.bannedID);

    const banEmbed = new EmbedBuilder()
      .setDescription([
        heading(`${time(date, 'R')} — Ban ID: ${ban.date}`, 2),
        `${bold(user.username)} — User ID: ${bold(user.id)}`,
        `Banned By: ${bold(author.username)}`,
        ban.unbanned ? heading('[This user has since been unbanned]\n', 3) : '',
        ban.reason,
        '',
        italic(`You can ${ban.unbanned ? 'delete this ban' : `unban ${user.username}`} using ${chatInputApplicationCommandMention('ban', 'remove', '1258736685680951296')}!`)
      ].join('\n'))
      .setColor('Purple');

    await this.interaction.editReply({ embeds: [banEmbed] });
  }

  private async viewBans(user?: User) {
    const bans = await this.getBansFromDatabase(user);

    const embedDescription: Array<string> = [
      heading(`${bans.length} ban(s) for ${user ? user.username : this.guild.name}`, 2)
    ];
    for await (const ban of bans) {
      const bannedUser = user ? user : await client.users.fetch(ban.bannedID);
      const date = new Date(Number(ban.date));

      embedDescription.push(
        `${bold(time(date, 'R'))} — Ban ID: ${bold(ban.date)}`,
        `${bold(bannedUser.username)} — User ID: ${bold(bannedUser.id)}`,
        ''
      );
    }

    const bansEmbed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor('Purple');

    await this.interaction.editReply({ embeds: [bansEmbed] });
  }

  // == Database Methods ==
  private async getBanFromDatabase(banID: string) {
    const result = await database.ban.findUnique({
      where: { date: banID }
    });

    return result;
  }

  private async getBansFromDatabase(user?: User) {
    const guildID = this.guild.id;
    const bannedID = user?.id;

    const result = await database.ban.findMany({
      where: { guildID, bannedID },
      orderBy: { date: 'desc' }
    });

    return result;
  }
}

class WarningViewer extends Command {
  private id: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.id = (interaction.options.getString('id') || '').replace(/[^0-9]/g, '');
  }

  async handle() {
    if (!this.id) return this.viewWarnings();

    const warning = await this.getWarningFromDatabase(this.id);
    const user = await client.users.fetch(this.id).catch(() => { });

    if (warning) this.viewWarning(warning);
    else if (user) this.viewWarnings(user);
    else await this.interaction.editReply(`${inlineCode(this.id)} is not a valid @mention, User ID, or Warning ID!`);
  }

  private async viewWarning(warning: Warning) {
    const date = new Date(Number(warning.date));
    const author = await client.users.fetch(warning.authorID);
    const user = await client.users.fetch(warning.warnedID);

    const warningEmbed = new EmbedBuilder()
      .setDescription([
        heading(`${time(date, 'R')} — Warn ID: ${warning.date}`, 2),
        `${bold(user.username)} — User ID: ${bold(user.id)}`,
        `Warned By: ${bold(author.username)}`,
        '',
        warning.reason,
      ].join('\n'))
      .setColor('Purple');

    await this.interaction.editReply({ embeds: [warningEmbed] });
  }

  private async viewWarnings(user?: User) {
    const warnings = await this.getWarningsFromDatabase(user);

    const embedDescription: Array<string> = [
      heading(`${warnings.length} warning(s) for ${user ? user.username : this.guild.name}`, 2)
    ];
    for await (const warning of warnings) {
      const warnedUser = user ? user : await client.users.fetch(warning.warnedID);
      const date = new Date(Number(warning.date));

      embedDescription.push(
        `${bold(time(date, 'R'))} — Warn ID: ${bold(warning.date)}`,
        `${bold(warnedUser.username)} — User ID: ${bold(warnedUser.id)}`,
        ''
      );
    }

    const warningsEmbed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor('Purple');

    await this.interaction.editReply({ embeds: [warningsEmbed] });
  }

  // == Database Methods ==
  private async getWarningFromDatabase(warningID: string) {
    const result = await database.warning.findUnique({
      where: { date: warningID }
    });

    return result;
  }

  private async getWarningsFromDatabase(user?: User) {
    const guildID = this.guild.id;
    const warnedID = user?.id;

    const result = await database.warning.findMany({
      where: { guildID, warnedID },
      orderBy: { date: 'desc' }
    });

    return result;
  }
}
