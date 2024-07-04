import {
  REST, Routes, SlashCommandBuilder,
} from 'discord.js';
import * as dotenv from 'dotenv';
import { styleLog } from './utilities.js';

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
    .setName('warn')
    .setDescription('Warning Commands')
    .addSubcommand((subcommand) => subcommand
      .setName('add')
      .setDescription('Warn a user')
      .addStringOption((option) => option
        .setName('user')
        .setDescription('The @mention or ID of the user to warn')
        .setRequired(true))
      .addStringOption((option) => option
        .setName('reason')
        .setDescription('The reason for the warning (use \\n for a newline)')
        .setRequired(true))
      .addBooleanOption((option) => option
        .setName('dm')
        .setDescription('Should the user be notified via DMs that they were warned?')
        .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
      .setName('view')
      .setDescription('View all warnings in the guild, or a user\'s warnings if specified')
      .addStringOption((option) => option
        .setName('user')
        .setDescription('The @mention or ID of the user to view warnings of')
        .setRequired(false)))
    .addSubcommand((subcommand) => subcommand
      .setName('remove')
      .setDescription('Remove a warning from a user')
      .addStringOption((option) => option
        .setName('warning')
        .setDescription('The ID of the warning to remove')
        .setRequired(true))),

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
