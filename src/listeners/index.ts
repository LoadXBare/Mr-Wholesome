/*
 * Here I dynamically import all files that contain event listeners
 * in order to run them each exactly once so they begin listening
 * out for their respective event.
*/

// guild-ban

// guild-member
import('./guild-member/guild-member-update.js');

// message
import('./message/message-create.js');
import('./message/message-update.js');

// role

// other
import('./interaction-create.js');
import('./ready.js');