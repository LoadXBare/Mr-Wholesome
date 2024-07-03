import Cron from "croner";
import { GuildMember, TextChannel } from "discord.js";
import { lastBirthdayCheck } from "./api.js";
import { ChannelIDs, RoleIDs, akialytesGuild, database } from "./config.js";
import { formatDate, styleLog } from "./utilities.js";

export default class Scheduler {
  start() {
    this.#birthdayScheduler();

    Cron('0 0 0 * * *', () => this.#birthdayScheduler());
  }

  async #birthdayScheduler() {
    const date = new Date().getUTCDate();
    const lastCheckDate = await lastBirthdayCheck.get();
    if (lastCheckDate === date) return;

    await this.#postBirthdayMessage();
    await this.#updateBirthdayRole();
  }

  async #postBirthdayMessage() {
    const birthdays = await this.#fetchTodaysBirthdays();
    const birthdayMembers = birthdays
      .map((birthday) => akialytesGuild.members.cache.get(birthday.userID))
      .filter((member): member is GuildMember => member instanceof GuildMember);

    if (birthdayMembers.length === 0) return;

    const messageMembers: Array<string> = [];
    birthdayMembers.forEach((member, index) => {
      if (birthdayMembers.length === 1) messageMembers.push(`${member}'s`);
      else if (index === 0) messageMembers.push(`${member}'s`);
      else if (index === birthdayMembers.length - 1) messageMembers.push(` and ${member}'s`);
      else messageMembers.push(`, ${member}'s`);
    });
    const birthdayMessage = [
      `### Today is ${messageMembers.join('')} birthday!`,
      'Let\'s wish them a happy birthday 🥳'
    ].join('\n');

    const birthdayChannel = akialytesGuild.channels.cache.get(ChannelIDs.Birthday);
    if (!(birthdayChannel instanceof TextChannel)) return styleLog('Error fetching birthday channel from cache!', false, 'scheduler.js');
    await birthdayChannel.send(birthdayMessage);
    await lastBirthdayCheck.set(new Date().getUTCDate());
  }

  async #updateBirthdayRole() {
    const birthdayRole = akialytesGuild.roles.cache.get(RoleIDs.Birthday);
    if (!birthdayRole) return styleLog('Error fetching birthday role from cache!', false, 'scheduler.js');

    const birthdays = await this.#fetchTodaysBirthdays();
    const birthdayMembers = birthdays
      .map((birthday) => akialytesGuild.members.cache.get(birthday.userID))
      .filter((member): member is GuildMember => member instanceof GuildMember);

    const nonBirthdayMembers = birthdayRole.members
      .map((member) => member) // Convert Collection to Array
      .filter((member) => !birthdayMembers.includes(member));
    for (const member of nonBirthdayMembers) {
      await member.roles.remove(birthdayRole);
    }

    for (const member of birthdayMembers) {
      await member.roles.add(birthdayRole);
    };
  }

  // == DATABASE METHODS ==
  async #fetchTodaysBirthdays() {
    const date = formatDate(new Date().getUTCDate(), new Date().getUTCMonth());
    const birthdays = await database.birthday.findMany({
      where: { date }
    });

    return birthdays;
  }
}
