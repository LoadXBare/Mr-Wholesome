/*
 * Here I dynamically import all files that contain event listeners
 * in order to run them each exactly once so they begin listening
 * out for their respective event.
*/

// guild-ban
import('./guild-ban/guild-ban-add.js');
import('./guild-ban/guild-ban-remove.js');

// guild-member
import('./guild-member/guild-member-add.js');
import('./guild-member/guild-member-remove.js');
import('./guild-member/guild-member-update.js');

// message
import('./message/message-create.js');
import('./message/message-delete.js');
import('./message/message-update.js');

// role
import('./role/guild-role-create.js');
import('./role/guild-role-delete.js');
import('./role/guild-role-update.js');

// other
import('./interaction-create.js');
import('./ready.js');
