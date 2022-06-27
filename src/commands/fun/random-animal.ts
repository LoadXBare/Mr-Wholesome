import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { BotCommand } from '../..';
import { COLORS } from '../../config/constants.js';

type Cat = Array<{
	breeds: Array<string>,
	id: string,
	url: string,
	width: number,
	height: number
}>

type Dog = Array<{
	breeds: Array<string>,
	id: string,
	url: string,
	width: number,
	height: number
}>

type Fox = {
	image: string,
	link: string
}

export const cat = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const response: Cat = await (await fetch('https://api.thecatapi.com/v1/images/search')).json();
	const catImageEmbed = new MessageEmbed()
		.setImage(response.at(0).url)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [catImageEmbed] });
};

export const dog = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const response: Dog = await (await fetch('https://api.thedogapi.com/v1/images/search')).json();
	const dogImageEmbed = new MessageEmbed()
		.setImage(response.at(0).url)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [dogImageEmbed] });
};

export const fox = async (args: BotCommand): Promise<void> => {
	const { message } = args;
	const response: Fox = await (await fetch('https://randomfox.ca/floof/')).json();
	const foxImageEmbed = new MessageEmbed()
		.setImage(response.image)
		.setColor(COLORS.COMMAND);

	message.reply({ embeds: [foxImageEmbed] });
};
