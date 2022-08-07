import { EmbedBuilder, inlineCode } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { BotCommand } from '../../index.js';

export const ping = async (args: BotCommand): Promise<void> => {
	const { message } = args;

	const reply = await message.reply({ content: 'uwu' });
	const pingCommand = new EmbedBuilder()
		.setTitle('Tweet!')
		.setDescription(`⌛ ⇒ ${inlineCode(`${reply.createdTimestamp - message.createdTimestamp}ms`)}\
		\n☁️ ⇒ ${inlineCode(`${message.client.ws.ping}ms`)}`)
		.setColor(COLORS.COMMAND);

	reply.edit({ content: null, embeds: [pingCommand] });
};
