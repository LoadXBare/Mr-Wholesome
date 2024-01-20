import { Birthday } from '@prisma/client';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import client from '../../index.js';
import { EmbedColours, database } from '../../lib/config.js';
import { Utils } from '../../lib/utilities.js';

export default class BirthdayCommand {
  interaction: ChatInputCommandInteraction;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
  }

  handle() {
    const command = this.interaction.options.getSubcommand();

    if (command === 'set') this.#handleSetBirthday();
    else if (command === 'upcoming') this.#handleUpcomingBirthdays();
    else this.interaction.reply('Something went wrong :(');
  }

  async #handleSetBirthday() {
    await this.interaction.deferReply();

    const day = this.interaction.options.getInteger('day', true);
    const month = this.interaction.options.getInteger('month', true);
    const birthday = await this.#setBirthdayInDatabase(this.interaction.user.id, day, month);

    const embedDescription: Array<string> = [];
    const embed = new EmbedBuilder();

    if (birthday !== undefined) {
      embed.setColor(EmbedColours.Success);
      embedDescription.push(
        '## Successfully set birthday!',
        `Your birthday has been set to **${birthday.date}**.`,
      );
    } else {
      embed.setColor(EmbedColours.Error);
      embedDescription.push(
        '## Unable to set birthday!',
        'An error occurred when attempting to set your birthday :(',
      );
    }

    embed.setDescription(embedDescription.join('\n'));

    await this.interaction.editReply({ embeds: [embed] });
  }

  async #handleUpcomingBirthdays() {
    await this.interaction.deferReply();

    const upcomingDayLimit = this.interaction.options.getNumber('days', false) ?? 14;
    const upcomingBirthdays = await this.#fetchUpcomingBirthdaysFromDatabase(upcomingDayLimit);
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

    const embed = new EmbedBuilder()
      .setDescription(embedDescription.join('\n'))
      .setColor(EmbedColours.Info);

    await this.interaction.editReply({ embeds: [embed] });
  }

  #formatDate(day: number, month: number) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const formattedDay = `${day}${Utils.nth(day)}`;
    const formattedMonth = months.at(month) ?? 'N/A';

    return `${formattedDay} ${formattedMonth}`;
  }

  // == Datebase Methods ==
  async #setBirthdayInDatabase(userID: string, day: number, month: number) {
    const date = this.#formatDate(day, month);
    const result = await database.birthday.upsert({
      where: { userID },
      create: { date, userID },
      update: { date },
    });

    return result;
  }

  async #fetchUpcomingBirthdaysFromDatabase(days: number) {
    const upcomingDays = new Array(days)
      .fill(new Date().getUTCDate())
      .map((value, index) => this.#formatDate(value + index, new Date().getUTCMonth()));

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
