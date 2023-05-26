import { ChannelType, REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
	new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Edit Mr Wholesome\'s settings')
		.addSubcommandGroup(group => group
			.setName('logs')
			.setDescription('Edit Mr Wholesome\'s moderation logs settings')
			.addSubcommand(subcommand => subcommand
				.setName('ignore')
				.setDescription('Ignore a channel and stop monitoring events from it')
				.addChannelOption(option => option
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
						ChannelType.PublicThread
					)
				)
			)
			.addSubcommand(subcommand => subcommand
				.setName('unignore')
				.setDescription('Unignore a channel and start monitoring events from it')
				.addChannelOption(option => option
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
						ChannelType.PublicThread
					)
				)
			)
			.addSubcommand(subcommand => subcommand
				.setName('view')
				.setDescription('View the channel moderation logs are currently being sent to')
			)
			.addSubcommand(subcommand => subcommand
				.setName('set')
				.setDescription('Choose the channel that moderation logs will be sent to')
				.addChannelOption(option => option
					.setName('channel')
					.setDescription('The channel that moderation logs should be sent to')
					.addChannelTypes(ChannelType.GuildText)
					.setRequired(true)
				)
			)
			.addSubcommand(subcommand => subcommand
				.setName('reset')
				.setDescription('Reset the channel that moderation logs are sent to')
			)
		),

	new SlashCommandBuilder()
		.setName('ping')
		.setDescription('View Mr Wholesome\'s ping')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken('MTA2ODQ2MjgyNjY5NzUzMTQ0Mw.GA84dN.W3qqNRRFQbExLUc05HkClJAp6AkcJ6wNqas0xk');
rest.put(Routes.applicationGuildCommands('1068462826697531443', '1010933712084537414'), { body: commands })
	.then(() => console.log(`Successfully registered ${commands.length} application commands!`));
