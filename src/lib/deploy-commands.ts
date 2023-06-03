import {
  ChannelType, REST, Routes, SlashCommandBuilder,
} from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Edit Mr Wholesome\'s settings')
    .addSubcommandGroup((group) => group
      .setName('logs')
      .setDescription('Edit Mr Wholesome\'s moderation logs settings')
      .addSubcommand((subcommand) => subcommand
        .setName('ignore')
        .setDescription('Ignore a channel and stop monitoring events from it')
        .addChannelOption((option) => option
          .setName('channel')
          .setDescription('The channel to ignore')
          .setRequired(true)
          .addChannelTypes(
            ChannelType.AnnouncementThread,
            ChannelType.GuildAnnouncement,
            ChannelType.GuildForum,
            ChannelType.GuildStageVoice,
            ChannelType.GuildText,
            ChannelType.GuildVoice,
            ChannelType.PrivateThread,
            ChannelType.PublicThread,
          )))
      .addSubcommand((subcommand) => subcommand
        .setName('ignored')
        .setDescription('View the channels events aren\'t being monitored from'))
      .addSubcommand((subcommand) => subcommand
        .setName('unignore')
        .setDescription('Unignore a channel and start monitoring events from it')
        .addChannelOption((option) => option
          .setName('channel')
          .setDescription('The channel to unignore')
          .setRequired(true)
          .addChannelTypes(
            ChannelType.AnnouncementThread,
            ChannelType.GuildAnnouncement,
            ChannelType.GuildForum,
            ChannelType.GuildStageVoice,
            ChannelType.GuildText,
            ChannelType.GuildVoice,
            ChannelType.PrivateThread,
            ChannelType.PublicThread,
          )))),

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
    .setDescription('Birthday commands')
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
    .setDescription('Post a random fox image')
].map((command) => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN ?? '');

if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
  rest.put(Routes.applicationGuildCommands(process.env.BOT_ID ?? '', process.env.BOT_TESTING_GUILD_ID ?? ''), { body: commands })
    .then(() => console.log(`✅ | Successfully registered ${commands.length} application commands for Bot Testing Den!`))
    .catch((e) => console.log('❌ | An error occurred when registering guild application commands!\n', e));
} else {
  rest.put(Routes.applicationCommands(process.env.BOT_ID ?? ''), { body: commands })
    .then(() => console.log(`✅ | Successfully registered ${commands.length} application commands globally!`))
    .catch((e) => console.log('❌ | An error occurred when registering global application commands!\n', e));
}
