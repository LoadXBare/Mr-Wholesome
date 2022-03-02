import { MessageEmbed, TextChannel } from 'discord.js';
import { BotCommand } from '..';
import { COLORS } from '../config/constants';

export const cache = async (args: BotCommand) => {
	const { message } = args;
	let messageCacheSize = 0;

	const reply = await message.reply({ content: 'Fetching cache sizes, this may take a while...' });

	message.client.channels.cache.filter((c) => c.type === 'GUILD_TEXT').forEach((channel: TextChannel) => {
		messageCacheSize += channel.messages.cache.size;
	});

	const cacheInfo = new MessageEmbed()
		.setTitle('Cache Info')
		.setDescription(`Here are the current cache sizes:\
		\nGuilds - ${message.client.guilds.cache.size}\
		\nEmojis - ${message.client.emojis.cache.size}\
		\nUsers - ${message.client.users.cache.size}\
		\nChannels - ${message.client.channels.cache.size}\
		\nMessages - ${messageCacheSize}`)
		.setColor(COLORS.COMMAND);

	await reply.edit({ content: null, embeds: [cacheInfo] });
};
