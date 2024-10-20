import { client } from '@base';
import { CommandHandler } from '@commands/command.js';
import { EmbedColours } from '@lib/config.js';
import { stripIndents } from 'common-tags';
import { EmbedBuilder } from 'discord.js';

export class PingCommandHandler extends CommandHandler {
  async handle() {
    if (!this.checkChannelEligibility(true, false)) return this.postChannelIneligibleMessage(false);
    await this.interaction.deferReply();

    const interactionResponse = await this.interaction.channel!.send('uwu');
    const botLatency = interactionResponse.createdTimestamp - this.interaction.createdTimestamp;
    interactionResponse.delete();

    const embeds = [new EmbedBuilder()
      .setDescription(stripIndents`
        ## Tweet! 🐦
        **⌛ User <-> Bot Latency** — \`${botLatency}ms\`
        **☁️ Bot <-> API Latency** — \`${client.ws.ping}ms\``
      )
      .setColor(EmbedColours.Info)];

    await this.interaction.editReply({ embeds });
  }
}
