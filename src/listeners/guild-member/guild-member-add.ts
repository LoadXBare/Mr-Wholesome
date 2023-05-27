import { EmbedBuilder, Events, GuildMember, TextBasedChannel } from "discord.js";
import { client } from "../../index.js";
import { BotColors } from "../../lib/config.js";
import { DatabaseUtils, Utils } from "../../lib/utilities.js";

class GuildMemberAddListener {
    static member: GuildMember;
    static logChannel: TextBasedChannel;

    static listener() {
        client.on(Events.GuildMemberAdd, (member) => {
            this.member = member;

            this.#run();
        });
    }

    static async #run() {
        const logChannel = await DatabaseUtils.fetchGuildLogChannel(this.member.guild.id);
        if (logChannel === null) return;

        this.logChannel = logChannel;
        this.#logMemberJoined();
    }

    static #logMemberJoined() {
        const embedDescription = [
            '## Member Joined',
            '### Member',
            this.member.user,
            '### Account Created',
            Utils.getRelativeTimeString(this.member.user.createdAt)
        ].join('\n');

        const embed = new EmbedBuilder()
            .setDescription(embedDescription)
            .setThumbnail(this.member.user.displayAvatarURL())
            .setFooter({
                text: `@${this.member.user.username} • User ID: ${this.member.user.id}`,
                iconURL: this.member.user.displayAvatarURL()
            })
            .setTimestamp()
            .setColor(BotColors.Positive);

        this.logChannel.send({ embeds: [embed] });
    }
}
GuildMemberAddListener.listener();
