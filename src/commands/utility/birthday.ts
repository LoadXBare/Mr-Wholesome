import { client } from '@base';
import { CommandHandler } from '@commands/command.js';
import { EmbedColours, database } from '@lib/config.js';
import { formatDate } from '@lib/utilities.js';
import { Birthday } from '@prisma/client';
import { stripIndents } from 'common-tags';
import { EmbedBuilder } from 'discord.js';

export class BirthdayCommandHandler extends CommandHandler {
  async handle() {
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

    const embeds = [new EmbedBuilder()
      .setDescription(stripIndents`
        ## Successfully set birthday!
        Your birthday has been set to **${birthday.date}**.`
      )
      .setColor(EmbedColours.Positive)
    ];

    await this.interaction.editReply({ embeds });
  }

  private async handleUpcomingBirthdays() {
    const upcomingDayLimit = this.interaction.options.getNumber('days', false) ?? 14;
    const upcomingBirthdays = await this.fetchUpcomingBirthdaysFromDatabase(upcomingDayLimit);

    if (!upcomingBirthdays) {
      return;
    }

    const upcomingBirthdaysList: Array<string> = [];
    upcomingBirthdays.forEach((birthday) => {
      const birthdayUser = client.users.resolve(birthday.userID);

      if (birthdayUser) {
        upcomingBirthdaysList.push(`- **@${birthdayUser.username}** — ${birthday.date}`);
      }
    });

    const embeds = [new EmbedBuilder()
      .setDescription(stripIndents`
        ## Upcoming Birthdays
        There are ${upcomingBirthdaysList.length} birthdays in the next ${upcomingDayLimit} days!
        ${upcomingBirthdaysList.join('\n')}`
      )
      .setColor(EmbedColours.Info)];

    await this.interaction.editReply({ embeds });
  }

  private async fetchUpcomingBirthdaysFromDatabase(days: number) {
    const upcomingDays = new Array(days)
      .fill(new Date().getUTCDate())
      .map((value, index) => formatDate(value + index, new Date().getUTCMonth()));

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
