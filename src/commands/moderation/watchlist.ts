import { ActionRowBuilder, EmbedBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { watchlistModalData } from "../../lib/api.js";
import { baseEmbed, database } from "../../lib/config.js";
import { CommandHandler } from "../command.js";

export class WatchlistCommandHandler extends CommandHandler {
  public async handle() {
    const command = this.interaction.options.getSubcommand();
    if (command === 'add_note') this.handleAddNote();
    else if (command === 'delete_note') this.handleDeleteNote();
  }

  private async handleAddNote() {
    const user = this.interaction.options.getUser('user', true);
    const displayName = this.interaction.user.displayName;

    const watchlistModal = new ModalBuilder()
      .setCustomId(`watchlist:${this.interaction.id}`)
      .setTitle(`Adding a note to ${displayName}`);

    const noteTextInput = new TextInputBuilder()
      .setCustomId('note')
      .setLabel('Note')
      .setPlaceholder('No note provided.')
      .setRequired(false)
      .setStyle(TextInputStyle.Paragraph);

    const noteActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(noteTextInput);
    watchlistModal.addComponents(noteActionRow);

    await this.interaction.showModal(watchlistModal);
    await watchlistModalData.set(this.interaction.id, user.id);
  }

  private async handleDeleteNote() {
    await this.interaction.deferReply();
    const noteID = this.interaction.options.getString('id', true);

    const result = await this.deleteNoteFromDatabase(noteID);
    if (!result) return this.handleError(`**${noteID}** is not a valid Note ID`);

    const displayName = this.interaction.user.displayName;
    const embed = new EmbedBuilder(baseEmbed)
      .setTitle(`${displayName}'s Watchlist`)
      .setDescription(`✅ Successfully deleted note of ID **${noteID}** from **${displayName}**`);

    await this.interaction.editReply({ embeds: [embed] });
  }

  private async deleteNoteFromDatabase(noteID: string) {
    const result = await database.notes.delete({
      where: {
        date: noteID
      }
    }).catch(() => null);

    return result;
  }
}
