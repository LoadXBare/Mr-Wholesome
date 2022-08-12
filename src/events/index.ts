import { Events } from '../index.js';
import { guildBanAdd } from './guild-ban-events/guild-ban-add.js';
import { guildBanRemove } from './guild-ban-events/guild-ban-remove.js';
import { guildMemberAdd } from './guild-member-events/guild-member-add.js';
import { guildMemberRemove } from './guild-member-events/guild-member-remove.js';
import { guildMemberUpdate } from './guild-member-events/guild-member-update.js';
import { interactionCreate } from './interaction-create.js';
import { messageCreate } from './message-events/message-create.js';
import { messageDelete } from './message-events/message-delete.js';
import { messageUpdate } from './message-events/message-update.js';
import { ready } from './ready.js';
import { roleCreate } from './role-events/role-create.js';
import { roleDelete } from './role-events/role-delete.js';
import { roleUpdate } from './role-events/role-update.js';

export const events: Events = {
	'guildBanAdd': guildBanAdd,
	'guildBanRemove': guildBanRemove,
	'guildMemberAdd': guildMemberAdd,
	'guildMemberRemove': guildMemberRemove,
	'guildMemberUpdate': guildMemberUpdate,
	'interactionCreate': interactionCreate,
	'messageCreate': messageCreate,
	'messageDelete': messageDelete,
	'messageUpdate': messageUpdate,
	'ready': ready,
	'roleCreate': roleCreate,
	'roleDelete': roleDelete,
	'roleUpdate': roleUpdate
};
