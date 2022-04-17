import { BotCommand } from '../..';
import { COMMAND_INFO } from '../../config/constants';
import { setBirthday } from './set';
import { upcomingBirthdays } from './upcoming';

export const birthday = async (args: BotCommand) => {
	const { commandArgs, message } = args;
	const operation = commandArgs.shift() ?? '';

	if (operation === 'set') {
		const birthday = commandArgs.shift() ?? '';

		setBirthday(message, birthday);
	} else if (operation === 'upcoming') {
		upcomingBirthdays(message);
	} else {
		message.reply({ embeds: [COMMAND_INFO.BIRTHDAY] });
	}
};
