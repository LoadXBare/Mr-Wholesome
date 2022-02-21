import { inlineCode } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { COLORS } from '../config/constants.js';
import { BotCommand } from '../index.js';

export const ping = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const pingDelay: string = (Date.now() - message.createdTimestamp).toString();

	const pingCommand: MessageEmbed = new MessageEmbed()
		.setTitle('Tweet!')
		.setDescription(`⌛ ${inlineCode(`${pingDelay}ms`)}`)
		.setColor(COLORS.COMMAND);

	await message.reply({ embeds: [pingCommand] });
};
