import { EmbedBuilder, Events, GuildMember, PartialGuildMember, TextBasedChannel } from "discord.js";
import { client } from "../../index.js";
import { BotColors } from "../../lib/config.js";
import { DatabaseUtils, Utils } from "../../lib/utilities.js";

class GuildMemberRemoveListener {
    static member: GuildMember | PartialGuildMember;
    static logChannel: TextBasedChannel;

    static listener() {
        client.on(Events.GuildMemberRemove, (member) => {
            this.member = member;

            this.#run();
        });
    }

    static async #run() {
        const logChannel = await DatabaseUtils.fetchGuildLogChannel(this.member.guild.id);
        if (logChannel === null) return;

        this.logChannel = logChannel;
        this.#logMemberLeave();
    }

    static #logMemberLeave() {
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
            .setColor(BotColors.Negative);

        this.logChannel.send({ embeds: [embed] });
    }
}
GuildMemberRemoveListener.listener();
