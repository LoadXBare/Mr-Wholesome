import { inlineCode } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { COLORS } from '../config/constants.js';
import { BotCommand } from '../index.js';

export const ping = async (args: BotCommand): Promise<void> => {
	const { message } = args;

	const reply = await message.reply({ content: 'uwu' });
	const pingCommand: MessageEmbed = new MessageEmbed()
		.setTitle('Tweet!')
		.setDescription(`⌛ ⇒ ${inlineCode(`${reply.createdTimestamp - message.createdTimestamp}ms`)}\
		\n☁️ ⇒ ${inlineCode(`${message.client.ws.ping}ms`)}`)
		.setColor(COLORS.COMMAND);

	reply.edit({ content: null, embeds: [pingCommand] });
};
