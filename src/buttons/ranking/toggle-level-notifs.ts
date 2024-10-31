import { stripIndents } from "common-tags";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import { levelNotifButtonData } from "../../lib/api.js";
import { baseEmbed, database } from "../../lib/config.js";
import { ButtonHandler } from "../button-handler.js";

export class ToggleLevelNotifButtonHandler extends ButtonHandler {
  async handle() {
    await this.interaction.deferReply({ ephemeral: true });
    const buttonData = await levelNotifButtonData.get(this.interaction.message.id);

    if (!buttonData) {
      return this.handleError('Error fetching button data from levelNotifButtonData.', true, 'toggle-level-notifs.js');
    }

    const { ownerID, levelNotifState } = buttonData;
    const userID = this.interaction.user.id;
    const clickNotFromOwner = userID !== ownerID;
    if (clickNotFromOwner) {
      return this.handleError('This button does not belong to you.');
    }

    const successfulUpdate = await database.rank.upsert({
      create: { guildID: this.guild.id, userID, levelNotifs: levelNotifState },
      update: { levelNotifs: !levelNotifState },
      where: { userID_guildID: { guildID: this.guild.id, userID } }
    }).catch(() => false).then(() => true);

    if (!successfulUpdate) {
      return this.handleError('Error updating level notification stat in RANK table!', true, 'toggle-level-notifs.js');
    }

    const displayName = this.interaction.user.displayName;
    const embed = new EmbedBuilder(baseEmbed)
      .setTitle(`${displayName}'s Level Notifications`)
      .setDescription(stripIndents
        `✅ Successfully ${!levelNotifState ? 'enabled' : 'disabled'} level up ping!
        You will ${levelNotifState ? 'no longer' : 'now'} be pinged when you level up.`
      );

    await this.disableButtonReusability();
    await levelNotifButtonData.del(this.interaction.message.id);

    await this.interaction.editReply({ embeds: [embed] });
  }

  private async disableButtonReusability() {
    const button = new ActionRowBuilder<ButtonBuilder>()
      .setComponents(
        new ButtonBuilder()
          .setCustomId(this.interaction.customId)
          .setLabel(this.interaction.component.label ?? 'Disabled')
          .setStyle(this.interaction.component.style)
          .setDisabled(true)
      );

    await this.interaction.message.edit({ components: [button] });
  }
}
