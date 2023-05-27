import { EmbedBuilder, Events, Role, TextBasedChannel } from "discord.js";
import { client } from "../../index.js";
import { BotColors } from "../../lib/config.js";
import { DatabaseUtils } from "../../lib/utilities.js";

class GuildRoleDeleteListener {
    static role: Role;
    static logChannel: TextBasedChannel;

    static listener() {
        client.on(Events.GuildRoleDelete, (role) => {
            this.role = role;

            this.#run();
        });
    }

    static async #run() {
        const logChannel = await DatabaseUtils.fetchGuildLogChannel(this.role.guild.id);
        if (logChannel === null) return;

        this.logChannel = logChannel;
        this.#roleDeleted();
    }

    static #roleDeleted() {
        const roleProperties = [
            `\n- **Name** — ${this.role.name}`,
            `\n- **Colour** — ${this.role.hexColor}`,
            `\n- **Hoisted?** — ${this.role.hoist ? 'Yes' : 'No'}`,
            `\n- **Created by bot?** — ${this.role.managed ? 'Yes' : 'No'}`,
            `\n- **Mentionable?** — ${this.role.mentionable ? 'Yes' : 'No'}`
        ];

        const embed = new EmbedBuilder()
            .setDescription(`## Role Deleted\n### Properties${roleProperties.join('')}`)
            .setFooter({
                text: `${this.role.guild.name} • Role ID: ${this.role.id}`,
                iconURL: this.role.guild.iconURL() ?? undefined
            })
            .setTimestamp()
            .setColor(BotColors.Negative);

        this.logChannel.send({ embeds: [embed] });
    }
}
GuildRoleDeleteListener.listener();
