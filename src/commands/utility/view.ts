import { client } from "@base";
import { CommandHandler } from "@commands/command.js";
import { baseEmbed, database, EmbedColours } from "@lib/config.js";
import { Ban, Notes, Warning } from "@prisma/client";
import { stripIndents } from "common-tags";
import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, time, User } from "discord.js";

export class ViewCommandHandler extends CommandHandler {
  async handle() {
    await this.interaction.deferReply();

    const subcommand = this.interaction.options.getSubcommand(true);
    if (subcommand === 'ban') new BanViewer(this.interaction).handle();
    else if (subcommand === 'warning') new WarningViewer(this.interaction).handle();
    else if (subcommand === 'watchlist') new WatchlistViewer(this.interaction).handle();
  }
}

class BanViewer extends CommandHandler {
  private id: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.id = (interaction.options.getString('id') || '').replace(/[^0-9]/g, '');
  }

  async handle() {
    if (!this.id) return this.viewBans();

    const ban = await database.ban.findUnique({ where: { date: this.id } }).catch(() => null);
    const user = await client.users.fetch(this.id).catch(() => null);

    if (ban) this.viewBan(ban);
    else if (user) this.viewBans(user);
    else this.handleError(`**${this.id}** is not a valid @mention, User ID, or Warning ID!`);
  }

  private async viewBan(ban: Ban) {
    const date = new Date(Number(ban.date));
    const author = await client.users.fetch(ban.authorID).catch(() => null);
    const user = await client.users.fetch(ban.bannedID).catch(() => null);

    if (!author || !user) {
      return this.handleError('Error fetching user data from Discord API!', true, 'view.js');
    }

    const embeds = [new EmbedBuilder()
      .setDescription(stripIndents`
        ## ${time(date, 'R')} — Ban ID: ${ban.date}
        **${user.username}** — User ID: **${user.id}**
        Banned By: **${author.username}**
        ${ban.unbanned ? '### [This user has since been unbanned]\n' : ''}
        ${ban.reason}
        
        ${ban.unbanned ? '' : `*You can unban ${user.username} using /unban ${user.id}`}`
      )
      .setColor(EmbedColours.Info)
    ];

    await this.interaction.editReply({ embeds });
  }

  private async viewBans(user?: User) {
    const bans = await database.ban.findMany({
      where: { guildID: this.guild.id, bannedID: user?.id },
      orderBy: { date: 'desc' }
    }).catch(() => null);

    if (!bans) {
      return this.handleError('Error fetching bans from BAN table!', true, 'view.js');
    }

    const embedDescription = [
      `## ${bans.length} ban(s) for ${user ? user.username : this.guild.name}`
    ];
    for await (const ban of bans) {
      const bannedUser = user ? user : await client.users.fetch(ban.bannedID);
      const date = new Date(Number(ban.date));
      const active = ban.unbanned ? '🟥' : '🟩';

      embedDescription.push(
        `${active} **${time(date, 'R')}** — Ban ID: **${ban.date}**`,
        `**${bannedUser.username}** — User ID: **${bannedUser.id}**`,
        ''
      );
    }

    const embeds = [new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setFooter({ text: '🟩 = active, 🟥 = unbanned' })
      .setColor(EmbedColours.Info)];

    await this.interaction.editReply({ embeds });
  }
}

class WarningViewer extends CommandHandler {
  private id: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.id = (interaction.options.getString('id') || '').replace(/[^0-9]/g, '');
  }

  async handle() {
    if (!this.id) return this.viewWarnings();

    const warning = await database.warning.findUnique({ where: { date: this.id } }).catch(() => null);
    const user = await client.users.fetch(this.id).catch(() => null);

    if (warning) this.viewWarning(warning);
    else if (user) this.viewWarnings(user);
    else this.handleError(`**${this.id}** is not a valid @mention, User ID, or Warning ID!`);
  }

  private async viewWarning(warning: Warning) {
    const date = new Date(Number(warning.date));
    const author = await client.users.fetch(warning.authorID).catch(() => null);
    const user = await client.users.fetch(warning.warnedID).catch(() => null);

    if (!author || !user) {
      return this.handleError('Error fetching user data from Discord API!', true, 'view.js');
    }

    const embeds = [new EmbedBuilder()
      .setDescription(stripIndents`
        ## ${time(date, 'R')} — Warn ID: ${warning.date}
        **${user.username}** — User ID: **${user.id}**
        Warned By: **${author.username}**
        
        ${warning.reason}`
      )
      .setColor(EmbedColours.Info)];

    await this.interaction.editReply({ embeds });
  }

  private async viewWarnings(user?: User) {
    const warnings = await database.warning.findMany({
      where: { guildID: this.guild.id, warnedID: user?.id },
      orderBy: { date: 'desc' }
    }).catch(() => null);

    if (!warnings) {
      return this.handleError('Error fetching warnings from WARNING table!', true, 'view.js');
    }

    const embedDescription = [
      `## ${warnings.length} warning(s) for ${user ? user.username : this.guild.name}`
    ];
    for await (const warning of warnings) {
      const warnedUser = user ? user : await client.users.fetch(warning.warnedID);
      const date = new Date(Number(warning.date));

      embedDescription.push(
        `**${time(date, 'R')}** — Warn ID: **${warning.date}**`,
        `**${warnedUser.username}** — User ID: **${warnedUser.id}**`,
        ''
      );
    }

    const embeds = [new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor(EmbedColours.Info)];

    await this.interaction.editReply({ embeds });
  }
}

class WatchlistViewer extends CommandHandler {
  private id: string;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.id = (interaction.options.getString('id') || '').replace(/[^0-9]/g, '');
  }

  public async handle() {
    if (!this.id) return this.viewGuildNotes();

    const note = await database.notes.findUnique({ where: { date: this.id } }).catch(() => null);
    const member = await this.guild.members.fetch(this.id).catch(() => null);

    if (note) this.viewNote(note);
    else if (member) this.viewMemberNotes(member);
    else this.handleError(`**${this.id}** is not a valid @mention, User ID or Note ID`);
  }

  private async viewNote(note: Notes) {
    const date = new Date(Number(note.date));
    const author = await this.guild.members.fetch(note.authorID).catch(() => null);
    const watched = await this.guild.members.fetch(note.watchedID).catch(() => null);

    if (!author || !watched) return this.handleError('Error fetching user data from Discord API', true, 'view.js');

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle(`${watched.displayName}'s Watchlist`)
      .setThumbnail(watched.displayAvatarURL())
      .setDescription(stripIndents`
        ### Note Text
        ${note.noteText}  
        `)
      .addFields([
        { name: 'Time', value: time(date, 'R'), inline: true },
        { name: 'Note ID', value: note.date, inline: true },
        { name: 'Watched', value: `@${watched.user.username} — User ID: ${watched.id}` },
        { name: 'Author', value: `@${author.user.username} — User ID: ${author.id}` }
      ]);

    await this.interaction.editReply({ embeds: [embed] });
  }

  private async viewGuildNotes() {
    const notes = await database.notes.findMany({
      where: {
        guildID: this.guild.id
      },
      orderBy: {
        date: 'desc'
      }
    });
    if (!notes) return this.handleError('Error fetching notes from NOTES table', true, 'view.js');

    const accumulator = new Map<string, { name: string, id: string, amount: number, latest: string; }>();
    for await (const note of notes) {
      const watchedName = await this.fetchMemberDisplayName(note.watchedID);
      const mappedNote = accumulator.get(note.watchedID);

      if (mappedNote) {
        mappedNote.amount++;
        if (mappedNote.latest < note.date) mappedNote.latest = note.date;
      } else {
        accumulator.set(note.watchedID, { amount: 1, id: note.watchedID, name: watchedName, latest: note.date });
      }
    }

    const embedDescription: Array<string> = [];
    accumulator.forEach((value) => {
      embedDescription.push(stripIndents`
        **${value.name}** — ${value.amount} note(s)
        ├ **User ID:** ${value.id}
        └ **Latest Note:** ${time(new Date(Number(value.latest)), 'R')}
        `);
    });

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle(`${this.guild.name}'s Watchlist`)
      .setThumbnail(this.guild.iconURL())
      .setDescription(embedDescription.join('\n\n'));

    await this.interaction.editReply({ embeds: [embed] });
  }

  private async viewMemberNotes(member: GuildMember) {
    const memberName = await this.fetchMemberDisplayName(member.id);
    const memberNotes = await database.notes.findMany({
      where: {
        guildID: this.guild.id,
        watchedID: member.id
      },
      orderBy: {
        date: 'desc'
      }
    });
    if (!memberNotes) return this.handleError('Error fetching notes from NOTES table', true, 'view.js');

    const embedDescription: Array<string> = [];
    if (memberNotes.length === 0) embedDescription.push(`${memberName} has no notes and therefore isn't on the watchlist`);

    memberNotes.forEach((note, index) => {
      embedDescription.push(stripIndents`
        **Note ${index + 1}**
        ├ **Time:** ${time(new Date(Number(note.date)), 'R')}
        └ **Note ID:** ${note.date}
      `);
    });

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle(`${memberName}'s Watchlist`)
      .setThumbnail(member.displayAvatarURL())
      .setDescription(embedDescription.join('\n\n'));

    await this.interaction.editReply({ embeds: [embed] });
  }
}
