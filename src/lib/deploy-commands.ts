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
