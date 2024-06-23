import {
  EmbedBuilder, Events, GuildMember, PartialGuildMember,
} from 'discord.js';
import client from '../../index.js';
import { EmbedColours, Emotes, EventHandler, Images, database } from '../../lib/config.js';

class GuildMemberUpdateHandler extends EventHandler {
  oldMember: GuildMember | PartialGuildMember;
  newMember: GuildMember;

  constructor(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
    super();
    this.oldMember = oldMember;
    this.newMember = newMember;
  }

  handle() {
    this.#logNicknameUpdate();
    this.#logRolesUpdate();
  }

  async #logNicknameUpdate() {
    if (this.oldMember.nickname === this.newMember.nickname) return;
    const oldNickname = this.oldMember.nickname;
    const newNickname = this.newMember.nickname;
    const embedDescription: Array<string> = [];

    if (oldNickname === null) {
      embedDescription.push('## Nickname Added', '### New Nickname', newNickname ?? '');
    } else if (newNickname === null) {
      embedDescription.push('## Nickname Reset', '### Old Nickname', oldNickname);
    } else {
      embedDescription.push('## Nickname Edited', '### Old Nickname', oldNickname, '### New Nickname', newNickname);
    }

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setFooter({
        text: `@${this.newMember.user.username} • User ID: ${this.newMember.user.id}`,
        iconURL: this.newMember.user.displayAvatarURL(),
      })
      .setTimestamp()
      .setColor(EmbedColours.Neutral);

    const watchlist = await this.#fetchWatchlist();
    const userOnWatchlist = watchlist.map((note) => note.watchedID).includes(this.newMember.id);
    if (userOnWatchlist) embed.setThumbnail(Images.WatchedUser);

    super.logChannel.send({ embeds: [embed] });
  }

  async #logRolesUpdate() {
    const oldRoles = this.oldMember.roles.cache;
    const newRoles = this.newMember.roles.cache;
    if (oldRoles.equals(newRoles)) return;

    const rolesDifference = oldRoles.difference(newRoles);
    const embedDescription = [
      '## Member Roles Updated',
      '### Role Changes',
    ];

    rolesDifference.forEach((role) => {
      const roleWasRemoved = oldRoles.has(role.id);

      if (roleWasRemoved) embedDescription.push(`${Emotes.Removed} ${role}`);
      else embedDescription.push(`${Emotes.Added} ${role}`);
    });

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setFooter({
        text: `@${this.newMember.user.username} • User ID: ${this.newMember.user.id}`,
        iconURL: this.newMember.user.displayAvatarURL(),
      })
      .setTimestamp()
      .setColor(EmbedColours.Neutral);

    const watchlist = await this.#fetchWatchlist();
    const userOnWatchlist = watchlist.map((note) => note.watchedID).includes(this.newMember.id);
    if (userOnWatchlist) embed.setThumbnail(Images.WatchedUser);

    super.logChannel.send({ embeds: [embed] });
  }

  // == Database Methods ==
  async #fetchWatchlist() {
    const result = await database.notes.findMany({
      where: { guildID: this.newMember.guild.id }
    });

    return result;
  }

}

client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
  new GuildMemberUpdateHandler(oldMember, newMember).handle();
});
