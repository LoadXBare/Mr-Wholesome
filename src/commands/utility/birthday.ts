import { Birthday } from '@prisma/client';
import { stripIndents } from 'common-tags';
import { EmbedBuilder } from 'discord.js';
import { baseEmbed, database } from '../../lib/config.js';
import { formatDate } from '../../lib/utilities.js';
import { CommandHandler } from '../command.js';

export class BirthdayCommandHandler extends CommandHandler {
  async handle() {
    if (!this.checkChannelEligibility(true, false)) return this.postChannelIneligibleMessage(false);
    await this.interaction.deferReply();

    const command = this.interaction.options.getSubcommand();
    if (command === 'set') this.handleSetBirthday();
    else if (command === 'upcoming') this.handleUpcomingBirthdays();
  }

  private async handleSetBirthday() {
    const day = this.interaction.options.getInteger('day', true);
    const month = this.interaction.options.getInteger('month', true);
    const date = formatDate(day, month);

    const birthday = await database.birthday.upsert({
      where: { userID: this.interaction.user.id },
      create: { date, userID: this.interaction.user.id },
      update: { date },
    }).catch(() => null);

    if (!birthday) {
      return this.handleError('Failed to upsert birthday to BIRTHDAY table!', true, 'birthday.js');
    }

    const displayName = this.interaction.user.displayName;
    const embed = new EmbedBuilder(baseEmbed)
      .setTitle(`${displayName}'s Birthday`)
      .setDescription(stripIndents
        `✅ Successfully set your birthday to **${birthday.date}**!`
      );

    await this.interaction.editReply({ embeds: [embed] });
  }

  private async handleUpcomingBirthdays() {
    const upcomingDayLimit = this.interaction.options.getNumber('days', false) ?? 14;
    const upcomingBirthdays = await this.fetchUpcomingBirthdaysFromDatabase(upcomingDayLimit);

    if (!upcomingBirthdays) {
      return;
    }

    const upcomingBirthdaysList: Array<string> = [];
    for await (const birthday of upcomingBirthdays) {
      const birthdayMember = await this.userInGuild(birthday.userID);

      if (birthdayMember) {
        upcomingBirthdaysList.push(`- **${birthdayMember.displayName}** — ${birthday.date}`);
      }
    }

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle(`Upcoming Birthdays in ${this.guild.name}`)
      .setDescription(stripIndents
        `There are ${upcomingBirthdaysList.length} birthdays in the next ${upcomingDayLimit} days!
        ${upcomingBirthdaysList.join('\n')}`
      );

    await this.interaction.editReply({ embeds: [embed] });
  }

  private async fetchUpcomingBirthdaysFromDatabase(days: number) {
    const upcomingDays: Array<string> = [];
    let currentDate = new Date();
    for (let i = 0; i < days; i++) {
      const day = currentDate.getUTCDate();
      const month = currentDate.getUTCMonth();
      upcomingDays.push(formatDate(day, month));

      currentDate.setUTCDate(day + 1);
    }

    const birthdays = await database.birthday.findMany().catch(() => null);

    if (!birthdays) {
      return this.handleError('Failed to fetch birthdays from BIRTHDAY table!', true, 'birthday.js');
    }

    const upcomingBirthdays: Array<Birthday> = [];
    upcomingDays.forEach((day) => {
      birthdays.forEach((birthday) => {
        if (birthday.date === day) upcomingBirthdays.push(birthday);
      });
    });

    return upcomingBirthdays;
  }
}
