import { styleLog } from '@lib/utilities.js';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('View Mr Wholesome\'s ping'),

  new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the 8ball a question')
    .addStringOption((option) => option
      .setName('question')
      .setDescription('The question to ask the 8ball')
      .setRequired(true)
      .setMinLength(1)),

  new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Birthday Commands')
    .addSubcommand((subcommand) => subcommand
      .setName('set')
      .setDescription('Set your birthday with Mr Wholesome')
      .addIntegerOption((option) => option
        .setName('day')
        .setDescription('The day of your birthday')
        .setMinValue(1)
        .setMaxValue(31)
        .setRequired(true))
      .addIntegerOption((option) => option
        .setName('month')
        .setDescription('The month of your birthday')
        .setChoices(
          { name: 'January', value: 0 },
          { name: 'February', value: 1 },
          { name: 'March', value: 2 },
          { name: 'April', value: 3 },
          { name: 'May', value: 4 },
          { name: 'June', value: 5 },
          { name: 'July', value: 6 },
          { name: 'August', value: 7 },
          { name: 'September', value: 8 },
          { name: 'October', value: 9 },
          { name: 'November', value: 10 },
          { name: 'December', value: 11 },
        )
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('upcoming')
      .setDescription('View the upcoming birthdays in the next 2 weeks')
      .addNumberOption((option) => option
        .setName('days')
        .setDescription('The number of days ahead to look for upcoming birthdays')
        .setMinValue(2)
        .setMaxValue(30)
        .setRequired(false))),

  new SlashCommandBuilder()
    .setName('cat')
    .setDescription('Post a random cat image'),

  new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Post a random dog image'),

  new SlashCommandBuilder()
    .setName('fox')
    .setDescription('Post a random fox image'),

  new SlashCommandBuilder()
    .setName('reading')
    .setDescription('View your reading for the day'),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user')
    .addUserOption((option) => option
      .setName('user')
      .setDescription('The user to ban')
      .setRequired(true))
    .addIntegerOption((option) => option
      .setName('delete_messages')
      .setDescription('Should the user\'s messages be deleted?')
      .setChoices(
        { name: 'Don\'t Delete Any', value: 0 },
        { name: 'Previous Hour', value: 60 * 60 },
        { name: 'Previous 6 Hours', value: 6 * 60 * 60 },
        { name: 'Previous 12 Hours', value: 12 * 60 * 60 },
        { name: 'Previous 24 Hours', value: 24 * 60 * 60 },
        { name: 'Previous 3 Days', value: 3 * 24 * 60 * 60 },
        { name: 'Previous 7 Days', value: 7 * 24 * 60 * 60 },
      )
      .setRequired(true))
    .addBooleanOption((option) => option
      .setName('notify_user')
      .setDescription('Should the user be notified via DMs that they were banned?')
      .setRequired(true)),

  new SlashCommandBuilder()
    .setName('view')
    .setDescription('View Commands')
    .addSubcommand((subcommand) => subcommand
      .setName('ban')
      .setDescription('View all bans in the guild, a user\'s bans, or a specific ban')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('The @mention, User ID, or Ban ID to view')
        .setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName('warning')
      .setDescription('View all warnings in the guild, a user\'s warnings, or a specific warning')
      .addStringOption((option) => option
        .setName('id')
        .setDescription('The @mention, User ID, or Warning ID to view')
        .setRequired(false))),

  new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user and mark their ban as removed')
    .addStringOption((option) => option
      .setName('user_id')
      .setDescription('The ID of the user to unban')
      .setRequired(true)),

  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption((option) => option
      .setName('user')
      .setDescription('The @mention or ID of the user to warn')
      .setRequired(true))
    .addBooleanOption((option) => option
      .setName('notify_user')
      .setDescription('Should the user be notified via DMs that they were warned?')
      .setRequired(true)),

  new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Remove a warning from a user')
    .addStringOption((option) => option
      .setName('warning_id')
      .setDescription('The ID of the warning to remove')
      .setRequired(true)),

  new SlashCommandBuilder()
    .setName('rank')
    .setDescription('View your server rank'),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server leaderboard')
    .addIntegerOption((option) => option
      .setName('page')
      .setDescription('The page number of the leaderboard to view')
      .setMinValue(1)
      .setRequired(false)),
].map((command) => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN ?? '');

if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
  rest.put(Routes.applicationGuildCommands(process.env.BOT_ID ?? '', process.env.BOT_TESTING_GUILD_ID ?? ''), { body: commands })
    .then(() => styleLog(`Locally registered ${commands.length} application commands!`, true, 'deploy-commands.js'))
    .catch((e) => styleLog('Error when locally registering application commands!', false, 'deploy-commands.js', e));
} else {
  rest.put(Routes.applicationCommands(process.env.BOT_ID ?? ''), { body: commands })
    .then(() => styleLog(`Globally registered ${commands.length} application commands!`, true, 'deploy-commands.js'))
    .catch((e) => styleLog('Error when globally registering application commands!', false, 'deploy-commands.js', e));
}
