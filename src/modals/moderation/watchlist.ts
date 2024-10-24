import { watchlistModalData } from "@lib/api.js";
import { baseEmbed, database } from "@lib/config.js";
import { ModalHandler } from "@modals/handler.js";
import { EmbedBuilder, GuildMember, ModalSubmitInteraction } from "discord.js";

export class WatchlistModalHandler extends ModalHandler {
  private note: string;

  public constructor(interaction: ModalSubmitInteraction) {
    super(interaction);
    this.note = interaction.fields.getTextInputValue('note') || 'No note provided.';
  }

  public async handle() {
    const [, id] = this.interaction.customId.split(':');

    const watchlistData = await watchlistModalData.get(id);
    if (!watchlistData) return this.handleError('Watchlist data cannot be found. Please try again.');
    await watchlistModalData.del(id);

    const member = await this.guild.members.fetch(watchlistData.userID).catch(() => null);
    if (!member) return this.handleError(`Member of ID **${watchlistData.userID}** not found. Please try again.`);

    const recorded = await this.addNoteToDatabase(member);
    if (!recorded) return this.handleError('Error occurred whilst creating note in NOTE table');

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle(`${member.displayName}'s Watchlist`)
      .setDescription(`✅ Successfully added a note to **${member.displayName}**`);

    await this.interaction.reply({ embeds: [embed] });
  }

  private async addNoteToDatabase(member: GuildMember) {
    const result = await database.notes.create({
      data: {
        authorID: this.interaction.user.id,
        date: Date.now().toString(),
        guildID: this.guild.id,
        noteText: this.note,
        watchedID: member.id
      }
    });

    return result;
  }
}
