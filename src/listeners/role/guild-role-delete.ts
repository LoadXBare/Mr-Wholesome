import { stripIndents } from 'common-tags';
import { EmbedBuilder, Events, Role } from 'discord.js';
import { client } from '../../index.js';
import { baseEmbed, EmbedColours, EventHandler } from '../../lib/config.js';

class GuildRoleDeleteHandler extends EventHandler {
  role: Role;

  constructor(role: Role) {
    super();
    this.role = role;
  }

  handle() {
    this.logDeletedRole();
  }

  private logDeletedRole() {
    const roleProperties = [
      `- **Name** — \`${this.role.name}\``,
      `- **Colour** — \`${this.role.hexColor}\``,
      `- **Hoisted?** — \`${this.role.hoist ? '✅' : '❌'}\``,
      `- **Created by bot?** — \`${this.role.managed ? '✅' : '❌'}\``,
      `- **Mentionable?** — \`${this.role.mentionable ? '✅' : '❌'}\``,
    ].join('\n');

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle('Role Deleted')
      .setDescription(stripIndents
        `### Properties
        ${roleProperties}`
      )
      .setFooter({
        text: `${this.role.guild.name} • Role ID: ${this.role.id}`,
        iconURL: this.role.guild.iconURL() ?? undefined,
      })
      .setTimestamp()
      .setColor(EmbedColours.Negative);

    super.logChannel.send({ embeds: [embed] });
  }
}

client.on(Events.GuildRoleDelete, (role) => {
  new GuildRoleDeleteHandler(role).handle();
});
