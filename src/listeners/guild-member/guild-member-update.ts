import { EmbedBuilder, Events, GuildMember, PartialGuildMember, Role } from "discord.js";
import { client } from "../../index.js";
import { EmbedColours, EventHandler } from "../../lib/config.js";

class GuildMemberUpdateHandler extends EventHandler {
	oldMember: GuildMember | PartialGuildMember;
	newMember: GuildMember;

	constructor(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
		super();
		this.oldMember = oldMember;
		this.newMember = newMember;
		this.#handle();
	}

	#handle() {
		this.#logNicknameUpdate();
		this.#logRolesUpdate();
	}

	#logNicknameUpdate() {
		if (this.oldMember.nickname === this.newMember.nickname) return;
		const oldNickname = this.oldMember.nickname;
		const newNickname = this.newMember.nickname;
		const embedDescription: Array<string> = [];

		if (oldNickname === null) {
			embedDescription.push(`## Nickname Added`, '### New Nickname', newNickname ?? '');
		}
		else if (newNickname === null) {
			embedDescription.push('## Nickname Reset', '### Old Nickname', oldNickname);
		}
		else {
			embedDescription.push('## Nickname Edited', '### Old Nickname', oldNickname, '### New Nickname', newNickname);
		}

		const embed = new EmbedBuilder()
			.setDescription(embedDescription.join('\n'))
			.setFooter({
				text: `@${this.newMember.user.username} • User ID: ${this.newMember.user.id}`,
				iconURL: this.newMember.user.displayAvatarURL()
			})
			.setTimestamp()
			.setColor(EmbedColours.Neutral);

		super.logChannel.send({ embeds: [embed] }); // TODO: alert if user on watchlist
	}

	#logRolesUpdate() {
		const oldRoles = this.oldMember.roles.cache;
		const newRoles = this.newMember.roles.cache;
		if (oldRoles.equals(newRoles)) return;

		const rolesDifference = oldRoles.difference(newRoles);
		const addedRoles: Array<Role> = [];
		const removedRoles: Array<Role> = [];

		for (const [string, role] of rolesDifference) {
			const roleWasRemoved = oldRoles.has(string);

			if (roleWasRemoved) removedRoles.push(role);
			else addedRoles.push(role);
		}

		const embedDescription = [
			'## Member Roles Updated'
		];
		if (addedRoles.length > 0) embedDescription.push('### Roles Added', addedRoles.map((r) => `- ${r}`).join('\n'));
		if (removedRoles.length > 0) embedDescription.push('### Roles Removed', removedRoles.map((r) => `- ${r}`).join('\n'));

		const embed = new EmbedBuilder()
			.setDescription(embedDescription.join('\n'))
			.setFooter({
				text: `@${this.newMember.user.username} • User ID: ${this.newMember.user.id}`,
				iconURL: this.newMember.user.displayAvatarURL()
			})
			.setTimestamp()
			.setColor(EmbedColours.Neutral);

		super.logChannel.send({ embeds: [embed] }); // TODO: alert if user on watchlist
	}
}

client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
	new GuildMemberUpdateHandler(oldMember, newMember);
});
