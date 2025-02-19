import { commaListsAnd } from "common-tags";
import Cron from "croner";
import { GuildMember, TextChannel } from "discord.js";
import { lastBirthdayCheck } from "./api.js";
import { ChannelIDs, RoleIDs, UserIDs, akialytesGuild, database } from "./config.js";
import { formatDate, styleLog } from "./utilities.js";

export default class Scheduler {
  start() {
    this.birthdayScheduler();
    Cron('0 0 0 * * *', () => this.birthdayScheduler()); // At 12:00 AM
  }

  private async birthdayScheduler() {
    const date = new Date().getUTCDate();
    const lastCheckDate = await lastBirthdayCheck.get();
    if (lastCheckDate === date) return;

    await this.postBirthdayMessage();
    await this.updateBirthdayRole();
  }

  private async postBirthdayMessage() {
    const birthdays = await this.fetchTodaysBirthdays();
    const birthdayMembers = birthdays
      .map((birthday) => akialytesGuild.members.cache.get(birthday.userID))
      .filter((member): member is GuildMember => member instanceof GuildMember);

    if (birthdayMembers.length === 0) return;

    const akialyne = await akialytesGuild.members.fetch(UserIDs.Akialyne).catch(() => null);
    if (!akialyne) return styleLog('Error fetching Akialyne member!', false, 'scheduler.js');

    const birthdayMembersString = birthdayMembers.map((member) => {
      if (member === akialyne) return `*definitely not ${member}'s*`;
      else return `${member}'s`;
    });

    const isAkiaBirthday = birthdayMembers.includes(akialyne);
    const onlyAkiaBirthday = isAkiaBirthday && birthdayMembers.length === 1;

    const birthdayMessage = commaListsAnd`
      ### Today is ${birthdayMembersString} birthday!
      ${onlyAkiaBirthday ? `Please continue your day as normal!` : `Let's wish ${isAkiaBirthday ? `all *but ${akialyne}, since it is not her birthday,*` : `them`} a happy birthday 🥳`}
    `;

    const birthdayChannel = akialytesGuild.channels.cache.get(ChannelIDs.Birthday);
    if (!(birthdayChannel instanceof TextChannel)) return styleLog('Error fetching birthday channel from cache!', false, 'scheduler.js');
    await birthdayChannel.send(birthdayMessage);
    await lastBirthdayCheck.set(new Date().getUTCDate());
  }

  private async updateBirthdayRole() {
    const birthdayRole = akialytesGuild.roles.cache.get(RoleIDs.Birthday);
    if (!birthdayRole) return styleLog('Error fetching birthday role from cache!', false, 'scheduler.js');

    const akialyne = await akialytesGuild.members.fetch(UserIDs.Akialyne).catch(() => null);
    if (!akialyne) return styleLog('Error fetching Akialyne member!', false, 'scheduler.js');

    const birthdays = await this.fetchTodaysBirthdays();
    const birthdayMembers = birthdays
      .map((birthday) => akialytesGuild.members.cache.get(birthday.userID))
      .filter((member): member is GuildMember => member instanceof GuildMember);

    const nonBirthdayMembers = birthdayRole.members
      .map((member) => member) // Convert Collection to Array
      .filter((member) => !birthdayMembers.includes(member));

    if (!birthdayMembers.includes(akialyne) && !nonBirthdayMembers.includes(akialyne)) await akialyne.roles.add(birthdayRole);

    for (const member of birthdayMembers) {
      if (member === akialyne) await member.roles.remove(birthdayRole);
      else await member.roles.add(birthdayRole);
    };

    for (const member of nonBirthdayMembers) {
      if (member === akialyne) continue;
      await member.roles.remove(birthdayRole);
    }
  }

  // == DATABASE METHODS ==
  private async fetchTodaysBirthdays() {
    const date = formatDate(new Date().getUTCDate(), new Date().getUTCMonth());
    const birthdays = await database.birthday.findMany({
      where: { date }
    });

    return birthdays;
  }
}
