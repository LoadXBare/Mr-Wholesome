import { EmbedBuilder, Events, Role, TextBasedChannel } from "discord.js";
import { client } from "../../index.js";
import { BotColors } from "../../lib/config.js";
import { DatabaseUtils } from "../../lib/utilities.js";

class GuildRoleCreateListener {
    static role: Role;
    static logChannel: TextBasedChannel;

    static listner() {
        client.on(Events.GuildRoleCreate, (role) => {
            this.role = role;

            this.#run();
        });
    }

    static async #run() {
        const logChannel = await DatabaseUtils.fetchGuildLogChannel(this.role.guild.id);
        if (logChannel === null) return;

        this.logChannel = logChannel;
        this.#logCreatedRole();
    }

    static #logCreatedRole() {
        const roleProperties = [
            `- **Name** — ${this.role.name}`,
            `- **Colour** — ${this.role.hexColor}`,
            `- **Hoisted?** — ${this.role.hoist ? 'Yes' : 'No'}`,
            `- **Created by bot?** — ${this.role.managed ? 'Yes' : 'No'}`,
            `- **Mentionable?** — ${this.role.mentionable ? 'Yes' : 'No'}`
        ].join('\n');

        const embedDescription = [
            '## Role Created',
            '### Properties',
            roleProperties
        ].join('\n');

        const embed = new EmbedBuilder()
            .setDescription(embedDescription)
            .setFooter({
                text: `${this.role.guild.name} • Role ID: ${this.role.id}`,
                iconURL: this.role.guild.iconURL() ?? undefined
            })
            .setTimestamp()
            .setColor(BotColors.Positive);

        this.logChannel.send({ embeds: [embed] });
    }
}
GuildRoleCreateListener.listner();
