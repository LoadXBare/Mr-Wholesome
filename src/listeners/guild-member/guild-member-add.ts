import { EmbedBuilder, Events, GuildMember } from 'discord.js';
import client from '../../index.js';
import { EmbedColours, EventHandler, Images, RoleIDs, database } from '../../lib/config.js';
import { getRelativeTimeString, sleep, styleLog } from '../../lib/utilities.js';

class GuildMemberAddHandler extends EventHandler {
  member: GuildMember;

  constructor(member: GuildMember) {
    super();
    this.member = member;
  }

  handle() {
    this.#logMemberJoined();
    this.#giveMemberRole();
  }

  async #logMemberJoined() {
    const embedDescription = [
      '## Member Joined',
      '### Member',
      this.member.user,
      '### Account Created',
      getRelativeTimeString(this.member.user.createdAt),
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setThumbnail(this.member.user.displayAvatarURL())
      .setFooter({
        text: `@${this.member.user.username} • User ID: ${this.member.user.id}`,
        iconURL: this.member.user.displayAvatarURL(),
      })
      .setTimestamp()
      .setColor(EmbedColours.Positive);

    const watchlist = await this.#fetchWatchlist();
    const userOnWatchlist = watchlist.map((note) => note.watchedID).includes(this.member.id);
    if (userOnWatchlist) embed.setThumbnail(Images.WatchedUser);

    super.logChannel.send({ embeds: [embed] });
  }

  async #giveMemberRole() {
    /*
     * This delay is necessary to prevent duplicate Member Role Updated embeds from being posted.
     * Because upon a user joining a server for the first time, multiple guild-member-update events
     * are fired simultaneously which leads to multiple Member Role Updated embeds being posted
     * 90% of the time.
     *
     * Having this delay allows the initial guild-member-update events to be fired and processed
     * first so no duplicate embeds occur when adding the role.
     */
    await sleep(1000);

    await this.member.roles.add(RoleIDs.Akialyte)
      .then(() => styleLog('Gave Akialyte role!', true, 'guild-member-add.js'))
      .catch((e) => styleLog('Error occurred while giving Akialyte role!', false, 'guild-member-add.js', e));
  }

  // == Database Methods ==
  async #fetchWatchlist() {
    const result = await database.notes.findMany({
      where: { guildID: this.member.guild.id }
    });

    return result;
  }
}

client.on(Events.GuildMemberAdd, (member) => {
  new GuildMemberAddHandler(member).handle();
});
