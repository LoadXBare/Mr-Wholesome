import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../config/constants.js';
import { BotCommand, Command } from '../../index.js';
import { sendError } from '../../lib/misc/send-error.js';

const eightBallCommand = (args: BotCommand): void => {
	const { commandArgs, message } = args;
	const question = commandArgs.join(' ');
	const positive = {
		chance: 4,
		type: 'positive',
		responses: [
			'It is certain.',
			'It is decidedly so.',
			'Without a doubt.',
			'Yes definitely.',
			'You may rely on it.',
			'As I see it, yes.',
			'Most likely.',
			'Outlook good.',
			'Yes.',
			'Signs point to yes.'
		]
	};
	const neutral = {
		chance: 2,
		type: 'neutral',
		responses: [
			'Reply hazy, try again.',
			'Ask again later.',
			'Better not tell you now.',
			'Cannot predict now.',
			'Concentrate and ask again.'
		]
	};
	const negative = {
		chance: 4,
		type: 'negative',
		responses: [
			'Don\'t count on it.',
			'My reply is no.',
			'My sources say no.',
			'Outlook not so good.',
			'Very doubtful.'
		]
	};

	const responsePool = [];
	for (let i = 0; i < positive.chance; i++) {
		responsePool.push(positive);
	}
	for (let i = 0; i < neutral.chance; i++) {
		responsePool.push(neutral);
	}
	for (let i = 0; i < negative.chance; i++) {
		responsePool.push(negative);
	}

	const randomResponseList = responsePool.at(Math.floor(Math.random() * responsePool.length));
	const randomResponse = randomResponseList.responses.at(Math.floor(Math.random() * randomResponseList.responses.length));

	if (commandArgs.length === 0) {
		sendError(message, 'You must enter a question!');
		return;
	}
	else if (!question.endsWith('?')) {
		sendError(message, 'That doesn\'t look like a question!\n\n*End your sentence with a question mark.*');
		return;
	}

	const responseEmbed = new EmbedBuilder()
		.setAuthor({
			name: message.author.tag,
			iconURL: message.member.displayAvatarURL()
		})
		.setDescription(`*${question}*\
		\n\n**${randomResponse}**`);

	if (randomResponseList.type === 'positive') {
		responseEmbed.setColor(COLORS.SUCCESS);
	}
	else if (randomResponseList.type === 'negative') {
		responseEmbed.setColor(COLORS.FAIL);
	}
	else {
		responseEmbed.setColor('Yellow');
	}

	message.reply({ embeds: [responseEmbed] });
};

export const eightBall: Command = {
	devOnly: false,
	modOnly: false,
	run: eightBallCommand,
	type: 'Fun'
};
