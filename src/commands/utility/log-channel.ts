import { channelMention, EmbedBuilder, inlineCode, Message } from 'discord.js';
import { BotCommand } from '../..';
import { mongodb } from '../../api/mongo.js';
import { BOT_PREFIX, COLORS } from '../../config/constants.js';
import { sendError } from '../../lib/misc/send-error.js';

const setLogChannel = async (message: Message, channelID: string): Promise<void> => {
	let logChannelID = channelID.replace(/\D/g, '');
	if (logChannelID.length === 0) {
		logChannelID = 'undefined';
	}

	const logChannel = await message.guild.channels.fetch(logChannelID).catch(() => { });
	if (typeof logChannel === 'undefined') {
		sendError(message, `${inlineCode(channelID)} is not a valid Channel!`);
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

export const logchannel = async (args: BotCommand): Promise<void> => {
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
