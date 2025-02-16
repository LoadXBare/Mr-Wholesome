import { stripIndents } from 'common-tags';
import { EmbedBuilder } from 'discord.js';
import { baseEmbed, ChannelIDs } from '../../lib/config.js';
import { CommandHandler } from '../command.js';

export class PingCommandHandler extends CommandHandler {
  async handle() {
    const allowedChannelIDs = [ChannelIDs.BotSpam];
    if (!this.checkChannelEligibility(allowedChannelIDs)) return this.postChannelIneligibleMessage(allowedChannelIDs);
    await this.interaction.deferReply();

    const interactionResponse = await this.interaction.channel!.send('uwu');
    const botLatency = interactionResponse.createdTimestamp - this.interaction.createdTimestamp;
    interactionResponse.delete();

    const embed = new EmbedBuilder(baseEmbed)
      .setTitle('Tweet! 🐦')
      .setDescription(stripIndents
        `**⌛ User <-> Bot Latency** — \`${botLatency}ms\`
        **☁️ Bot <-> API Latency** — \`${this.interaction.client.ws.ping}ms\``
      );

    await this.interaction.editReply({ embeds: [embed] });
  }
}
