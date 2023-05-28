import { ChannelType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { EmbedColours } from "../../lib/config.js";
import { DatabaseUtils } from "../../lib/utilities.js";

export class SettingsCommand {
	static interaction: ChatInputCommandInteraction;

	static run(interaction: ChatInputCommandInteraction) {
		this.interaction = interaction;

		const commandGroup = this.interaction.options.getSubcommandGroup();
		if (commandGroup === 'logs') this.#handleLogsSettings();
	}

	static async #handleLogsSettings() {
		const ignore = async () => {
			const channelToIgnore = this.interaction.options.getChannel('channel', true, [
				ChannelType.AnnouncementThread,
				ChannelType.GuildAnnouncement,
				ChannelType.GuildForum,
				ChannelType.GuildStageVoice,
				ChannelType.GuildText,
				ChannelType.GuildVoice,
				ChannelType.PrivateThread,
				ChannelType.PublicThread
			]);

			const success = await DatabaseUtils.addEventIgnoredChannel(this.interaction.guildId, channelToIgnore.id);
			const embed = new EmbedBuilder();

			if (success) {
				embed
					.setDescription(`## Successfully ignored ${channelToIgnore}!\nEvents will no longer be logged from it.`)
					.setColor(EmbedColours.Success);
			}
			else {
				embed
					.setDescription(`## Channel already ignored!\n${channelToIgnore} is either already ignored or an error occurred.`)
					.setColor(EmbedColours.Error);
			}

			this.interaction.reply({ embeds: [embed] });
		};

		const unignore = async () => {
			const channelToUnignore = this.interaction.options.getChannel('channel', true, [
				ChannelType.AnnouncementThread,
				ChannelType.GuildAnnouncement,
				ChannelType.GuildForum,
				ChannelType.GuildStageVoice,
				ChannelType.GuildText,
				ChannelType.GuildVoice,
				ChannelType.PrivateThread,
				ChannelType.PublicThread
			]);

			const success = await DatabaseUtils.removeEventIgnoredChannel(this.interaction.guildId, channelToUnignore.id);
			const embed = new EmbedBuilder();

			if (success) {
				embed
					.setDescription(`## Successfully unignored ${channelToUnignore}!\nEvents will now be logged from it.`)
					.setColor(EmbedColours.Success);
			}
			else {
				embed
					.setDescription(`## Channel not ignored!\n${channelToUnignore} is either not ignored or an error occurred.`)
					.setColor(EmbedColours.Error);
			}

			this.interaction.reply({ embeds: [embed] });
		};

		const view = async () => {
			let description = '## No channel set!\nThis guild currently has no channel set to receive moderation logs.';

			const logChannel = await DatabaseUtils.fetchGuildLogChannel(this.interaction.guildId);
			if (logChannel !== null) {
				description = `## Log channel is ${logChannel}!\nThis guild currently has ${logChannel} set to receive moderation logs.`;
			}

			const embed = new EmbedBuilder()
				.setDescription(description)
				.setColor(EmbedColours.Info);

			this.interaction.reply({ embeds: [embed] });
		};

		const set = async () => {
			const logChannel = this.interaction.options.getChannel('channel', true, [ChannelType.GuildText]);

			const success = await DatabaseUtils.updateGuildLogChannel(this.interaction.guildId, logChannel.id);
			const embed = new EmbedBuilder();

			if (success) {
				embed
					.setDescription(`## Successfully set to ${logChannel}!\nThis guild is now set to receive moderation logs in ${logChannel}!`)
					.setColor(EmbedColours.Success);
			}
			else {
				embed
					.setDescription(`## Something went wrong 💥`)
					.setColor(EmbedColours.Error);
			}

			this.interaction.reply({ embeds: [embed] });
		};

		const reset = async () => {
			const success = await DatabaseUtils.resetGuildLogChannel(this.interaction.guildId);
			const embed = new EmbedBuilder();

			if (success) {
				embed
					.setDescription('## Successfully reset!\nThis guild\'s log channel has been reset!')
					.setColor(EmbedColours.Success);
			}
			else {
				embed
					.setDescription('## Something went wrong 💥')
					.setColor(EmbedColours.Error);
			}

			this.interaction.reply({ embeds: [embed] });
		};

		const command = this.interaction.options.getSubcommand();

		if (command === 'ignore') ignore();
		else if (command === 'unignore') unignore();
		else if (command === 'view') view();
		else if (command === 'set') set();
		else if (command === 'reset') reset();
	}
}
