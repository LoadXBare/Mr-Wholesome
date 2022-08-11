import { codeBlock, EmbedBuilder, inlineCode } from 'discord.js';
import fetch from 'node-fetch';
import { COLORS } from '../../config/constants.js';
import { BotCommand, TradingCard } from '../../index.js';

const checkTextLength = (text: string): string => {
	const maxTextLength = 1024;
	if (text.length > maxTextLength) {
		return `${text.slice(0, 990)}...`;
	} else {
		return text;
	}
};

const formatSupportCardInfo = (tradingCard: TradingCard): EmbedBuilder => {
	let references = '';
	if (tradingCard.references.length > 0) {
		tradingCard.references.forEach((reference) => {
			const cleanedRef = reference.trim().replace(/\n/g, '');
			references = references.concat(`• ${cleanedRef}\n`);
		});
	}
	else {
		references = 'None';
	}

	const infoEmbed = new EmbedBuilder()
		.setTitle(`Showing Card Info for ${tradingCard.displayname}`)
		.setDescription(
			`**Character Name:** ${tradingCard.charactername}
			**Card Title:** ${tradingCard.cardtitle}
			**Card Class:** ${tradingCard.cardclass}
			**Character Type(s)**: [${tradingCard.type1.trim()}] [${tradingCard.type2.trim()}]`
		)
		.setFields([
			{ name: 'Support Effect', value: tradingCard.supporteffect },
			{ name: 'Character Description', value: checkTextLength(tradingCard.chardesc) },
			{ name: 'References', value: references }
		])
		.setColor(COLORS.COMMAND);

	return infoEmbed;
};

const formatAttackCardInfo = (tradingCard: TradingCard): EmbedBuilder => {
	let references = '';
	if (tradingCard.references.length > 0) {
		for (const ref of tradingCard.references) {
			const refCleaned = ref.trim().replace(/\n/g, '');
			references = references.concat(`• ${refCleaned}\n`);
		}
	}
	else {
		references = 'None';
	}

	const infoEmbed = new EmbedBuilder()
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
			{ name: 'Character Description', value: checkTextLength(tradingCard.chardesc) },
			{ name: 'References', value: references }
		])
		.setColor(COLORS.COMMAND);

	return infoEmbed;
};

export const tcg = async (args: BotCommand): Promise<void> => {
	const { commandArgs, message } = args;

	const userToLookup = commandArgs.shift() ?? 'undefined';
	const commandFlag = commandArgs.shift() ?? '';
	const requestURL = `http://akialytes-tcg.glitch.me/query?username=${userToLookup}`;

	const commandReply = await message.reply('Fetching data, please wait...');
	let response: TradingCard;

	try {
		response = await (await fetch(requestURL)).json() as TradingCard;
	}
	catch (e) {
		commandReply.edit({ content: `There was an error when fetching from the database! ${codeBlock(e)}` });
		return;
	}

	if (commandFlag === '-r') {
		const rawResponseEmbed = new EmbedBuilder()
			.setDescription(codeBlock(JSON.stringify(response)))
			.setColor(COLORS.COMMAND);

		try {
			commandReply.edit({ content: null, embeds: [rawResponseEmbed] });
		}
		catch {
			commandReply.edit({ content: '**Raw content exceeded 6000 characters in length!**' });
		}

		return;
	}

	if (response.cardclass === 'support') {
		commandReply.edit({ content: null, embeds: [formatSupportCardInfo(response)] });
	}
	else if (response.cardclass === 'attack') {
		commandReply.edit({ content: null, embeds: [formatAttackCardInfo(response)] });
	}
	else {
		commandReply.edit({ content: `User ${inlineCode(userToLookup)} either doesn't exist or doesn't have a database entry.` });
	}
};
