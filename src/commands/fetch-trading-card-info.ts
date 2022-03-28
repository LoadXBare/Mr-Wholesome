import { codeBlock, inlineCode } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { BotCommand } from '..';
import { COLORS } from '../config/constants';

type TradingCard = {
	saveOnly: boolean,
	type1: string,
	type2: string,
	displayname: string,
	fulltext: string,
	move2effect: string,
	supporteffect: string,
	references: Array<string>,
	cardtitle: string,
	hp: string,
	move1dmg: string,
	passive: string,
	trellocard: string,
	move2dmg: string,
	move1type: string,
	cardclass: string,
	move2name: string,
	move1effect: string,
	move2type: string,
	charactername: string,
	move1name: string,
	chardesc: string,
	subbed: boolean
};

const formatSupportCardInfo = (tradingCard: TradingCard) => {
	let references = '';
	if (tradingCard.references.length > 0) {
		tradingCard.references.forEach((reference) => {
			const cleanedRef = reference.trim().replace(/\n/g, '');
			references = references.concat(`• ${cleanedRef}\n`);
		});
	} else {
		references = 'None';
	}

	const info = new MessageEmbed()
		.setTitle(`Showing Card Info for ${tradingCard.displayname}`)
		.setDescription(
			`**Character Name:** ${tradingCard.charactername}
			**Card Title:** ${tradingCard.cardtitle}
			**Card Class:** ${tradingCard.cardclass}
			**Character Type(s)**: [${tradingCard.type1.trim()}] [${tradingCard.type2.trim()}]`
		)
		.setFields([
			{ name: 'Support Effect', value: tradingCard.supporteffect },
			{ name: 'Character Description', value: tradingCard.chardesc },
			{ name: 'References', value: references }
		])
		.setColor(COLORS.COMMAND);
	return info;
};

const formatAttackCardInfo = (tradingCard: TradingCard) => {
	let references = '';
	if (tradingCard.references.length > 0) {
		tradingCard.references.forEach((reference) => {
			const cleanedRef = reference.trim().replace(/\n/g, '');
			references = references.concat(`• ${cleanedRef}\n`);
		});
	} else {
		references = 'None';
	}

	const info = new MessageEmbed()
		.setTitle(`Showing Card Info for ${tradingCard.displayname}`)
		.setDescription(
			`**Character Name:** ${tradingCard.charactername}
			**Card Title:** ${tradingCard.cardtitle}
			**Card Class:** ${tradingCard.cardclass}
			**Character Type(s):** [${tradingCard.type1.trim()}] [${tradingCard.type2.trim()}]
			**HP:** ${tradingCard.hp}`
		)
		.setFields([
			{
				name: 'Move 1',
				value: `**Name:** ${tradingCard.move1name}
				**Type:** ${tradingCard.move1type}
				**Description:** ${tradingCard.move1effect}`
			},
			{
				name: 'Move 2',
				value: `**Name:** ${tradingCard.move2name}
				**Type:** ${tradingCard.move2type}
				**Description:** ${tradingCard.move2effect}`
			},
			{ name: 'Passive Effect', value: tradingCard.passive },
			{ name: 'Character Description', value: tradingCard.chardesc },
			{ name: 'References', value: references }
		])
		.setColor(COLORS.COMMAND);

	return info;
};

export const tcg = async (args: BotCommand) => {
	const { commandArgs, message } = args;

	if (!message.member.permissions.has('KICK_MEMBERS')) {
		message.reply('You don\'t have permission to perform this command!');
		return;
	}

	const userToLookup = commandArgs.at(0) ?? '';
	const commandFlag = commandArgs.at(1) ?? '';
	const requestURL = `http://akialytes-tcg.glitch.me/query?username=${userToLookup}`;

	const commandReply = await message.reply('Fetching data, please wait...');

	const response = await (await fetch(requestURL)).json() as TradingCard;

	if (commandFlag === '-r') {
		const rawResponse = new MessageEmbed()
			.setDescription(codeBlock(JSON.stringify(response)))
			.setColor(COLORS.COMMAND);
		try {
			commandReply.edit({ content: null, embeds: [rawResponse] });
		} catch {
			commandReply.edit({ content: '**Raw content exceeded 6000 characters in length!**' });
		} finally {
			return;
		}
	}

	if (response.cardclass === 'support')
		commandReply.edit({ content: null, embeds: [formatSupportCardInfo(response)] });
	else if (response.cardclass === 'attack')
		commandReply.edit({ content: null, embeds: [formatAttackCardInfo(response)] });
	else {
		commandReply.edit({ content: `User ${inlineCode(userToLookup)} either doesn't exist or doesn't have a database entry.` });
	}
};
