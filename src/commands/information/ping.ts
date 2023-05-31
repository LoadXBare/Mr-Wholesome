import { ChatInputCommandInteraction } from 'discord.js';
import client from '../../index.js';

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
    const content = [
      '## Tweet! 🐦',
      `### ⌛ Bot Latency — \`${Date.now() - interactionResponse.createdTimestamp}ms\``,
      `### ☁️ API Latency — \`${client.ws.ping}ms\``,
    ].join('\n');

    await this.interaction.editReply(content);
  }
}
export default PingCommand;
