import {
  EmbedBuilder, Events, GuildMember, PartialGuildMember,
} from 'discord.js';
import client from '../../index.js';
import { EmbedColours, EventHandler, Images, database } from '../../lib/config.js';
import { Utils } from '../../lib/utilities.js';

class GuildMemberRemoveHandler extends EventHandler {
  member: GuildMember | PartialGuildMember;

  constructor(member: GuildMember | PartialGuildMember) {
    super();
    this.member = member;
  }

  handle() {
    this.#logMemberLeave();
  }

  async #logMemberLeave() {
    const memberRolesList = this.member.roles.cache.map((r) => `- ${r}`).join('\n');
    const embedDescription = [
      '## Member Left',
      '### Member',
      this.member.user,
      '### Roles',
      memberRolesList,
      '### Join Date',
      Utils.getRelativeTimeString(this.member.joinedAt ?? Date.now()),
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setFooter({
        text: `@${this.member.user.username} • User ID: ${this.member.user.id}`,
        iconURL: this.member.user.displayAvatarURL(),
      })
      .setTimestamp()
      .setColor(EmbedColours.Negative);

    const watchlist = await this.#fetchWatchlist();
    const userOnWatchlist = watchlist.map((note) => note.watchedID).includes(this.member.id);
    if (userOnWatchlist) embed.setThumbnail(Images.WatchedUser);

    super.logChannel.send({ embeds: [embed] });
  }

  // == Database Methods ==
  async #fetchWatchlist() {
    const result = await database.notes.findMany({
      where: { guildID: this.member.guild.id }
    });

    return result;
  }
}

client.on(Events.GuildMemberRemove, (member) => {
  new GuildMemberRemoveHandler(member).handle();
});
