import { channelMention, EmbedBuilder, inlineCode, Message } from 'discord.js';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { fetchDiscordTextChannel } from '../../lib/misc/fetch-discord-text-channel.js';
import { sendError } from '../../lib/misc/send-error.js';

const setLogChannel = async (message: Message, channelID: string): Promise<void> => {
	const logChannelID = channelID.replace(/\D/g, '');

	const logChannel = await fetchDiscordTextChannel(message.guild, logChannelID);

	if (logChannel === null) {
		sendError(message, `${channelMention(logChannelID)} is not a valid Text Channel!`);
		return;
	}

	await mongodb.guildConfig.updateOne(
		{
			guildID: message.guildId
		},
		{
			$set: { logChannelID: logChannel.id }
		},
		{
			upsert: true
		}
	);

	const logChannelSetEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setTitle('Log Channel')
		.setDescription(`Successfully set log channel to ${channelMention(logChannel.id)}!`)
		.setColor(COLORS.SUCCESS);

	message.reply({ embeds: [logChannelSetEmbed] });

};

const logChannelCommand = async (args: BotCommand): Promise<void> => {
	const { commandArgs, message } = args;
	const operation = commandArgs.shift() ?? 'undefined';

	if (operation === 'set') {
		const channelID = commandArgs.shift() ?? 'undefined';

		setLogChannel(message, channelID);
	}
	else {
		sendError(message, `${inlineCode(operation)} is not a valid operation!\
		\n*For help, run ${inlineCode(`${BOT_PREFIX}help logchannel`)}*`);
	}
};

export const logChannel: Command = {
	devOnly: false,
	modOnly: true,
	run: logChannelCommand,
	type: 'Utility'
};
