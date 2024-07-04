import { ChatInputCommandInteraction } from "discord.js";
import WarningAdder from "./add.js";
import WarningRemover from "./remove.js";
import WarningViewer from "./view.js";

export default class WarnCommand {
  interaction: ChatInputCommandInteraction;
  command: string;

  constructor(interaction: ChatInputCommandInteraction) {
    this.interaction = interaction;
    this.command = interaction.options.getSubcommand(true);
  }

  async handle() {
    await this.interaction.deferReply();

    if (this.command === 'view') new WarningViewer(this.interaction).handle();
    else if (this.command === 'remove') new WarningRemover(this.interaction).handle();
    else if (this.command === 'add') new WarningAdder(this.interaction).handle();
  }
}
