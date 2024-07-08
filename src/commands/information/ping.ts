import { client } from '@base';
import { Command } from '@commands/command.js';
import { EmbedColours } from '@lib/config.js';
import { EmbedBuilder, heading, inlineCode } from 'discord.js';

export class PingCommandHandler extends Command {
  async handle() {
    const interactionResponse = await this.interaction.channel!.send('uwu');
    const botLatency = interactionResponse.createdTimestamp - this.interaction.createdTimestamp;
    interactionResponse.delete();

    const pingEmbed = new EmbedBuilder()
      .setDescription([
        heading('Tweet! 🐦', 2),
        heading(`⌛ Bot Latency — ${inlineCode(`${botLatency}ms`)}`, 3),
        heading(`☁️ API Latency — ${inlineCode(`${client.ws.ping}ms`)}`, 3),
      ].join('\n'))
      .setColor(EmbedColours.Info);

    await this.interaction.reply({ embeds: [pingEmbed] });
  }
}
