import { closeTicket } from './close-ticket.js';
import { createTicket } from './create-ticket.js';
import { deleteTicket } from './delete-ticket.js';
import { openTicket } from './open-ticket.js';
import { updateRole } from './update-role.js';

type Interactions = {
	[interaction: string]: Function
}

const interactions: Interactions = {
	'closeTicket': closeTicket,
	'createTicket': createTicket,
	'deleteTicket': deleteTicket,
	'openTicket': openTicket,
	'role': updateRole
};

export default interactions;
