import { Interactions } from '../index.js';
import { closeTicket } from './close-ticket.js';
import { createTicket } from './create-ticket.js';
import { deleteTicket } from './delete-ticket.js';
import { levelUpNotifications } from './level-up-notifications.js';
import { openTicket } from './open-ticket.js';
import { updateRole } from './update-role.js';

export const interactions: Interactions = {
	'closeTicket': closeTicket,
	'createTicket': createTicket,
	'deleteTicket': deleteTicket,
	'openTicket': openTicket,
	'role': updateRole,
	'xpButton': levelUpNotifications
};
