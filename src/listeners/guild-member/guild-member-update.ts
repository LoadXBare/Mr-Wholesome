import { EmbedBuilder, Events, GuildMember, PartialGuildMember, Role, TextBasedChannel } from "discord.js";
import { client } from "../../index.js";
import { BotColors } from "../../lib/config.js";
import { DatabaseUtils } from "../../lib/utilities.js";

class GuildMemberUpdateListener {
    static oldMember: GuildMember | PartialGuildMember;
    static newMember: GuildMember;
    static logChannel: TextBasedChannel;

    static listener() {
        client.on(Events.GuildMemberUpdate, (oldMember, newMember) => {
            this.oldMember = oldMember;
            this.newMember = newMember;

            this.#run();
        });
    }

    static async #run() {
        const logChannel = await DatabaseUtils.fetchGuildLogChannel(this.newMember.guild.id);
        if (logChannel === null) return;

        this.logChannel = logChannel;
        this.#nicknameUpdate();
        this.#rolesUpdate();
    }

    static #nicknameUpdate() {
        if (this.oldMember.nickname === this.newMember.nickname) return;
        const oldNickname = this.oldMember.nickname;
        const newNickname = this.newMember.nickname;

        const embed = new EmbedBuilder()
            .setFooter({
                text: `@${this.newMember.user.username} • User ID: ${this.newMember.user.id}`,
                iconURL: this.newMember.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(BotColors.Neutral);

        if (oldNickname === null) {
            embed.setDescription(`## Nickname Added\n### New Nickname\n${newNickname}`);
        }
        else if (newNickname === null) {
            embed.setDescription(`## Nickname Reset\n### Old Nickname\n${oldNickname}`);
        }
        else {
            embed.setDescription(`## Nickname Edited\n### Old Nickname\n${oldNickname}\n### New Nickname\n${newNickname}`);
        }

        this.logChannel.send({ embeds: [embed] });
    }

    static #rolesUpdate() {
        if (this.oldMember.roles.cache.equals(this.newMember.roles.cache)) return;
        const oldRoles = this.oldMember.roles.cache;
        const newRoles = this.newMember.roles.cache;
        const rolesDifference = oldRoles.difference(newRoles);
        const addedRoles: Array<Role> = [];
        const removedRoles: Array<Role> = [];

        for (const [string, role] of rolesDifference) {
            const roleRemoved = oldRoles.has(string);

            if (roleRemoved) removedRoles.push(role);
            else addedRoles.push(role);
        }
        const addedRolesDescription =
            addedRoles.length > 0
                ? `\n### Roles Added${addedRoles.map((r) => `\n- ${r}`).join('')}`
                : '';
        const removedRolesDescription =
            removedRoles.length > 0
                ? `\n### Roles Removed${removedRoles.map((r) => `\n- ${r}`).join('')}`
                : '';


        const embed = new EmbedBuilder()
            .setDescription(`## Member Roles Updated${addedRolesDescription}${removedRolesDescription}`)
            .setFooter({
                text: `@${this.newMember.user.username} • User ID: ${this.newMember.user.id}`,
                iconURL: this.newMember.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(BotColors.Neutral);

        this.logChannel.send({ embeds: [embed] });
    }
}
GuildMemberUpdateListener.listener();
