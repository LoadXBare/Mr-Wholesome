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
        this.#memberLeft();
    }

    static #memberLeft() {
        const embed = new EmbedBuilder()
            .setDescription(`## Member Left\n### Member\n${this.member.user}\n### Join Date\n${Utils.getRelativeTimeString(this.member.joinedAt ?? Date.now())}`)
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