import { CommandHandler } from "commands/command.js";
import { ApplicationCommandType, chatInputApplicationCommandMention, EmbedBuilder } from "discord.js";
import { baseEmbed, ChannelIDs, Emotes } from "lib/config.js";

export class HelpCommandHandler extends CommandHandler {
  async handle() {
    const allowedChannelIDs = [ChannelIDs.BotSpam];
    if (!this.checkChannelEligibility(allowedChannelIDs)) return this.postChannelIneligibleMessage(allowedChannelIDs);
    await this.interaction.deferReply();

    const funCommands = ['cat', 'dog', '8ball', 'fox', 'reading', 'writing'];
    const informationCommands = ['help', 'ping'];
    const moderationCommands = ['ban', 'unban', 'warn', 'unwarn', 'watchlist'];
    const rankingCommands = ['leaderboard', 'rank'];
    const utilityCommands = ['birthday', 'ticket-panel', 'ticket', 'view'];
    const slashCommands = (await this.fetchSlashCommands()).filter((command) => command.type === ApplicationCommandType.ChatInput);

    slashCommands.forEach((command) => {
      const { name, id } = command;

      if (funCommands.includes(name)) funCommands[funCommands.indexOf(name)] = chatInputApplicationCommandMention(name, id);
      else if (informationCommands.includes(name)) informationCommands[informationCommands.indexOf(name)] = chatInputApplicationCommandMention(name, id);
      else if (moderationCommands.includes(name)) moderationCommands[moderationCommands.indexOf(name)] = chatInputApplicationCommandMention(name, id);
      else if (rankingCommands.includes(name)) rankingCommands[rankingCommands.indexOf(name)] = chatInputApplicationCommandMention(name, id);
      else if (utilityCommands.includes(name)) utilityCommands[utilityCommands.indexOf(name)] = chatInputApplicationCommandMention(name, id);
    });

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle('Available Commands')
      .setFields([
        { name: '🥳 Fun', value: funCommands.join(' ') },
        { name: '📖 Information', value: informationCommands.join(' ') },
        { name: `${Emotes.Bonque} Moderation`, value: moderationCommands.join(' ') },
        { name: '🏆 Ranking', value: rankingCommands.join(' ') },
        { name: '⚙️ Utility', value: utilityCommands.join(' ') }
      ])
      .setFooter({ text: '💡 Commands that cannot be clicked have multiple subcommands that would take up too much space to display' });

    await this.interaction.editReply({ embeds: [embed] });
  }

  private async fetchSlashCommands() {
    const botEnvironment = process.env.ENVIRONMENT ?? '';

    if (botEnvironment === 'DEVELOPMENT') {
      const guildCommands = await this.guild.commands.fetch();
      return guildCommands;
    } else {
      const globalCommands = await this.interaction.client.application.commands.fetch();
      return globalCommands;
    }
  }
}
