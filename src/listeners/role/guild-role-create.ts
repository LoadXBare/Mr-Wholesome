import { client } from '@base';
import { baseEmbed, EventHandler } from '@lib/config.js';
import { stripIndents } from 'common-tags';
import { EmbedBuilder, Events, Role } from 'discord.js';

class GuildRoleCreateHandler extends EventHandler {
  role: Role;

  constructor(role: Role) {
    super();
    this.role = role;
  }

  handle() {
    this.#logCreatedRole();
  }

  #logCreatedRole() {
    const roleProperties = [
      `- **Name** — \`${this.role.name}\``,
      `- **Colour** — \`${this.role.hexColor}\``,
      `- **Hoisted?** — \`${this.role.hoist ? '✅' : '❌'}\``,
      `- **Created by bot?** — \`${this.role.managed ? '✅' : '❌'}\``,
      `- **Mentionable?** — \`${this.role.mentionable ? '✅' : '❌'}\``,
    ].join('\n');

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle('Role Created')
      .setDescription(stripIndents
        `### Properties
        ${roleProperties}`
      )
      .setFooter({
        text: `${this.role.guild.name} • Role ID: ${this.role.id}`,
        iconURL: this.role.guild.iconURL() ?? undefined,
      })
      .setTimestamp();

    super.logChannel.send({ embeds: [embed] });
  }
}

client.on(Events.GuildRoleCreate, (role) => {
  new GuildRoleCreateHandler(role).handle();
});
