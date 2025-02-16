import { channelMention, ChatInputCommandInteraction } from "discord.js";
import { BaseInteractionHandler } from "../lib/config.js";

export abstract class CommandHandler extends BaseInteractionHandler {
  protected interaction: ChatInputCommandInteraction;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.interaction = interaction;
  }

  protected postChannelIneligibleMessage(allowedChannelIDs: Array<string>) {
    const channelList = allowedChannelIDs.map((id) => channelMention(id)).join(', ');
    const content = `This command can only be ran in the following channels: ${channelList}`;

    if (this.interaction.deferred || this.interaction.replied) this.interaction.editReply({ content });
    else this.interaction.reply({ content, ephemeral: true });
  }

  protected checkChannelEligibility(allowedChannelIDs: Array<string>) {
    const commandAllowedInChannel = allowedChannelIDs.includes(this.interaction.channelId);
    const executorIsModerator = this.commandRanByModerator();

    if (executorIsModerator) return true;
    return commandAllowedInChannel;
  }

  private commandRanByModerator() {
    const memberPermissions = this.interaction.memberPermissions;
    if (!memberPermissions) return false;

    return memberPermissions.has('BanMembers');
  }
}
