import { client } from '@base';
import { baseEmbed, EventHandler } from '@lib/config.js';
import { EmbedBuilder, Events, Role } from 'discord.js';

class GuildRoleUpdateHandler extends EventHandler {
  oldRole: Role;

  newRole: Role;

  constructor(oldRole: Role, newRole: Role) {
    super();
    this.oldRole = oldRole;
    this.newRole = newRole;
  }

  handle() {
    this.#logRoleUpdate();
  }

  #logRoleUpdate() {
    const {
      name: oldName, hexColor: oldColour, hoist: oldHoist, mentionable: oldMentionable,
    } = this.oldRole;
    const {
      name: newName, hexColor: newColour, hoist: newHoist, mentionable: newMentionable,
    } = this.newRole;

    const oldPermissions = this.oldRole.permissions.toArray();
    const newPermissions = this.newRole.permissions.toArray();
    const permissionDifferences = oldPermissions
      .filter((r) => !newPermissions.includes(r))
      .concat(newPermissions.filter((r) => !oldPermissions.includes(r)));

    const embedDescription = [
      `### Role — ${this.newRole}`,
    ];

    const propertyChanges: Array<string> = [];
    if (oldName !== newName) propertyChanges.push(`- **Name** — \`${oldName}\` ➔ \`${newName}\``);
    if (oldColour !== newColour) propertyChanges.push(`- **Colour** — \`${oldColour}\` ➔ \`${newColour}\``);
    if (oldHoist !== newHoist) propertyChanges.push(`- **Hoisted?** — \`${oldHoist ? '✅' : '❌'}\` ➔ \`${newHoist ? '✅' : '❌'}\``);
    if (oldMentionable !== newMentionable) propertyChanges.push(`- **Mentionable?** — \`${oldMentionable ? '✅' : '❌'}\` ➔ \`${newMentionable ? '✅' : '❌'}\``);
    if (propertyChanges.length > 0) embedDescription.push('### Property Changes', propertyChanges.join('\n'));

    if (permissionDifferences.length > 0) {
      embedDescription.push('### Permission Changes');

      permissionDifferences.forEach((permission) => {
        const permissionWasRemoved = oldPermissions.includes(permission);

        if (permissionWasRemoved) embedDescription.push(`- **${permission}** — \`✅\` ➔ \`❌\``);
        else embedDescription.push(`- **${permission}** — \`❌\` ➔ \`✅\``);
      });
    }

    // No property changes or permission changes occurred (likely a position update)
    if (embedDescription.length < 3) return;

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle('Role Updated')
      .setDescription(embedDescription.join('\n'))
      .setFooter({
        text: `${this.newRole.guild.name} • Role ID: ${this.newRole.id}`,
        iconURL: this.newRole.guild.iconURL() ?? undefined,
      })
      .setTimestamp();

    super.logChannel.send({ embeds: [embed] });
  }
}

client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
  new GuildRoleUpdateHandler(oldRole, newRole).handle();
});
