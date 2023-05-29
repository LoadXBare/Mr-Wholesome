import { EmbedBuilder, Events, GuildMember, PartialGuildMember } from "discord.js";
import { client } from "../../index.js";
import { EmbedColours, EventHandler } from "../../lib/config.js";
import { Utils } from "../../lib/utilities.js";

class GuildMemberRemoveHandler extends EventHandler {
    member: GuildMember | PartialGuildMember;

    constructor(member: GuildMember | PartialGuildMember) {
        super();
        this.member = member;
        this.#handle();
    }

    #handle() {
        this.#logMemberLeave();
    }

    #logMemberLeave() {
        const memberRolesList = this.member.roles.cache.map((r) => `- ${r}`).join('\n');
        const embedDescription = [
            '## Member Left',
            '### Member',
            this.member.user,
            '### Roles',
            memberRolesList,
            '### Join Date',
            Utils.getRelativeTimeString(this.member.joinedAt ?? Date.now()),
        ].join('\n');

        const embed = new EmbedBuilder()
            .setDescription(embedDescription)
            .setFooter({
                text: `@${this.member.user.username} • User ID: ${this.member.user.id}`,
                iconURL: this.member.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(EmbedColours.Negative);

        super.logChannel.send({ embeds: [embed] }); // TODO: alert if user on watchlist
    }
}

client.on(Events.GuildMemberRemove, (member) => {
    new GuildMemberRemoveHandler(member);
});
