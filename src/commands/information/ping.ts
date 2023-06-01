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
    await this.interaction.deferReply();

    const interactionResponse = await this.interaction.editReply('uwu');
    const embedDescription = [
      '## Tweet! 🐦',
      `### ⌛ Bot Latency — \`${Date.now() - interactionResponse.createdTimestamp}ms\``,
      `### ☁️ API Latency — \`${client.ws.ping}ms\``,
    ].join('\n');
    const embed = new EmbedBuilder()
      .setDescription(embedDescription)
      .setColor(EmbedColours.Info);

    await this.interaction.editReply({ content: null, embeds: [embed] });
  }
}
export default PingCommand;
