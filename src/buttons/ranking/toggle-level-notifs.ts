import { levelNotifButtonData } from "@lib/api.js";
import { EmbedColours, database } from "@lib/config.js";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder } from "discord.js";

export default class ToggleLevelNotifButton {
  interaction: ButtonInteraction;

  constructor(interaction: ButtonInteraction) {
    this.interaction = interaction;
  }

  handle() {
    this.#toggleLevelNotif();
  }

  async #toggleLevelNotif() {
    await this.interaction.deferReply({ ephemeral: true });
    const buttonData = await levelNotifButtonData.get(this.interaction.message.id);

    if (!buttonData) return this.#handleError();

    const { ownerID, levelNotifState } = buttonData;
    const clickNotFromOwner = this.interaction.user.id !== ownerID;
    if (clickNotFromOwner) return this.#handleClickNotFromOwner();

    const successfulUpdate = await this.#updateLevelNotifStateInDatabase(!levelNotifState);

    let embed: EmbedBuilder;
    if (successfulUpdate) {
      const embedDescription = [
        `## Successfully ${!levelNotifState ? 'enabled' : 'disabled'} level up ping!`,
        `You will ${levelNotifState ? 'no longer' : 'now'} be pinged when you level up.`,
      ].join('\n');
      embed = new EmbedBuilder()
        .setDescription(embedDescription)
        .setColor(EmbedColours.Positive);

      await this.#disableButtonReusability();
      await levelNotifButtonData.del(this.interaction.message.id);
    }
    else {
      const embedDescription = [
        '## An error occurred!',
        'Please try again later.',
      ].join('\n');
      embed = new EmbedBuilder()
        .setDescription(embedDescription)
        .setColor(EmbedColours.Negative);
    }

    await this.interaction.editReply({ embeds: [embed] });
  }

  async #handleClickNotFromOwner() {
    await this.interaction.editReply({ content: 'This button does not belong to you.' });
  }

  async #handleError() {
    await this.interaction.editReply({ content: 'Button data cannot be found, __no changes have been made__.\n\n*LoadXBare has been notified.*' });
    await this.#disableButtonReusability();
  }

  async #disableButtonReusability() {
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

  // == Database Methods ==
  async #updateLevelNotifStateInDatabase(levelNotifState: boolean) {
    const guildID = this.interaction.guildId ?? '';
    const userID = this.interaction.user.id;

    const memberRank = await database.rank.upsert({
      where: { userID_guildID: { guildID, userID } },
      create: { guildID, userID, levelNotifs: levelNotifState },
      update: { levelNotifs: levelNotifState },
    });

    return memberRank;
  }
}
