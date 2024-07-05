import { client } from '@base';
import { EmbedColours, EventHandler } from '@lib/config.js';
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

    const embedDescription = [
      '## Role Created',
      '### Properties',
      roleProperties,
    ].join('\n');

    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setFooter({
        text: `${this.role.guild.name} • Role ID: ${this.role.id}`,
        iconURL: this.role.guild.iconURL() ?? undefined,
      })
      .setTimestamp()
      .setColor(EmbedColours.Positive);

    super.logChannel.send({ embeds: [embed] }); // TODO: Log all events to console too
  }
}

client.on(Events.GuildRoleCreate, (role) => {
  new GuildRoleCreateHandler(role).handle();
});
