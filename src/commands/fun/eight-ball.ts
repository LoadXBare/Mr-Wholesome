import { Command } from '@commands/command.js';
import { EmbedColours } from '@lib/config.js';
import { ColorResolvable, EmbedBuilder } from 'discord.js';

export class EightBallCommandHandler extends Command {
  async handle() {
    await this.interaction.deferReply();

    const question = this.interaction.options.getString('question', true);
    const responses: Array<{ response: string, colour: ColorResolvable; }> = [
      // Positive
      { response: 'It is certain.', colour: 'Green' },
      { response: 'It is decidedly so.', colour: 'Green' },
      { response: 'Without a doubt.', colour: 'Green' },
      { response: 'Yes - definitely.', colour: 'Green' },
      { response: 'You may rely on it.', colour: 'Green' },
      { response: 'As I see it, yes.', colour: 'Green' },
      { response: 'Most likely.', colour: 'Green' },
      { response: 'Outlook good.', colour: 'Green' },
      { response: 'Yes.', colour: 'Green' },
      { response: 'Signs point to yes.', colour: 'Green' },

      // Neutral
      { response: 'Reply hazy, try again.', colour: 'Yellow' },
      { response: 'Better not tell you now.', colour: 'Yellow' },

      // Negative
      { response: "Don't count on it.", colour: 'Red' },
      { response: 'My reply is no.', colour: 'Red' },
      { response: 'My sources say no.', colour: 'Red' },
      { response: 'Outlook not so good.', colour: 'Red' },
      { response: 'Very doubtful.', colour: 'Red' },
    ];

    const randomResponse = responses.at(Math.round(Math.random() * responses.length));

    const eightBallEmbed = new EmbedBuilder()
      .setDescription([
        `**Question** — *${question}*`,
        `## ${randomResponse?.response}`,
      ].join('\n'))
      .setColor(randomResponse?.colour || EmbedColours.Info);

    await this.interaction.editReply({ embeds: [eightBallEmbed] });
  }
}
