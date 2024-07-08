import { client } from '@base';
import { Command } from '@commands/command.js';
import { EmbedColours, database } from '@lib/config.js';
import { formatDate } from '@lib/utilities.js';
import { Birthday } from '@prisma/client';
import { EmbedBuilder } from 'discord.js';

export class BirthdayCommandHandler extends Command {
  async handle() {
    await this.interaction.deferReply();

    const command = this.interaction.options.getSubcommand();
    if (command === 'set') this.handleSetBirthday();
    else if (command === 'upcoming') this.handleUpcomingBirthdays();
  }

  private async handleSetBirthday() {
    const day = this.interaction.options.getInteger('day', true);
    const month = this.interaction.options.getInteger('month', true);
    const birthday = await this.setBirthdayInDatabase(this.interaction.user.id, day, month);

    const embedDescription: Array<string> = [];
    const birthdaySetEmbed = new EmbedBuilder();

    if (birthday) {
      birthdaySetEmbed.setColor(EmbedColours.Positive);
      embedDescription.push(
        '## Successfully set birthday!',
        `Your birthday has been set to **${birthday.date}**.`,
      );
    } else {
      birthdaySetEmbed.setColor(EmbedColours.Negative);
      embedDescription.push(
        '## Unable to set birthday!',
        'An error occurred when attempting to set your birthday :(',
      );
    }

    birthdaySetEmbed.setDescription(embedDescription.join('\n'));

    await this.interaction.editReply({ embeds: [birthdaySetEmbed] });
  }

  private async handleUpcomingBirthdays() {
    const upcomingDayLimit = this.interaction.options.getNumber('days', false) ?? 14;
    const upcomingBirthdays = await this.fetchUpcomingBirthdaysFromDatabase(upcomingDayLimit);
    const upcomingBirthdaysList: Array<string> = [];
    upcomingBirthdays.forEach((birthday) => {
      const birthdayUser = client.users.resolve(birthday.userID);
      if (birthdayUser !== null) {
        upcomingBirthdaysList.push(`- **@${birthdayUser?.username}** — ${birthday.date}`);
      }
    });

    const embedDescription = [
      '## Upcoming Birthdays',
    ];

    if (upcomingBirthdaysList.length === 0) embedDescription.push(`There are no birthdays in the next ${upcomingDayLimit} days!`);
    else if (upcomingBirthdaysList.length === 1) embedDescription.push(`There is 1 birthday in the next ${upcomingDayLimit} days!`);
    else embedDescription.push(`There are ${upcomingBirthdaysList.length} birthdays in the next ${upcomingDayLimit} days!`);
    embedDescription.push(upcomingBirthdaysList.join('\n'));

    const upcomingBirthdaysEmbed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor(EmbedColours.Info);

    await this.interaction.editReply({ embeds: [upcomingBirthdaysEmbed] });
  }

  // == Datebase Methods ==
  private async setBirthdayInDatabase(userID: string, day: number, month: number) {
    const date = formatDate(day, month);
    const result = await database.birthday.upsert({
      where: { userID },
      create: { date, userID },
      update: { date },
    });

    return result;
  }

  private async fetchUpcomingBirthdaysFromDatabase(days: number) {
    const upcomingDays = new Array(days)
      .fill(new Date().getUTCDate())
      .map((value, index) => formatDate(value + index, new Date().getUTCMonth()));

    const birthdays = await database.birthday.findMany();
    const upcomingBirthdays: Array<Birthday> = [];
    upcomingDays.forEach((day) => {
      birthdays.forEach((birthday) => {
        if (birthday.date === day) upcomingBirthdays.push(birthday);
      });
    });

    return upcomingBirthdays;
  }
}
