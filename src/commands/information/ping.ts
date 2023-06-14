import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import client from '../../index.js';
import { EmbedColours } from '../../lib/config.js';

class PingCommand {
  interaction: ChatInputCommandInteraction;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
  }

  handle() {
    this.#handlePingCommand();
  }

  async #handlePingCommand() {
    if (this.interaction.channel === null) return;

    const interactionResponse = await this.interaction.channel.send('uwu');
    const botLatency = interactionResponse.createdTimestamp - this.interaction.createdTimestamp;
    interactionResponse.delete();

    const embedDescription = [
      '## Tweet! 🐦',
      `### ⌛ Bot Latency — \`${botLatency}ms\``,
      `### ☁️ API Latency — \`${client.ws.ping}ms\``,
    ].join('\n');
    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setColor(EmbedColours.Info);

    await this.interaction.reply({ embeds: [embed] });
  }
}
export default PingCommand;
