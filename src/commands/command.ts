import { BaseInteractionHandler, ChannelIDs } from "@lib/config.js";
import { channelMention, ChatInputCommandInteraction } from "discord.js";

export abstract class CommandHandler extends BaseInteractionHandler {
  protected interaction: ChatInputCommandInteraction;

  constructor(interaction: ChatInputCommandInteraction) {
    super(interaction);
    this.interaction = interaction;
  }

  protected postChannelIneligibleMessage(comfyVibes: boolean) {
    // We're assuming here that commands that trigger this can always be ran in the BotSpam channel,
    // as the only commands that cannot be ran in either channel are moderator commands which have
    // their own permissions preventing non-moderators from running them anyway.
    const comfyVibesMessage = comfyVibes ? `or ${channelMention(ChannelIDs.ComfyVibes)}` : '';
    const content = `This command can only be ran in ${channelMention(ChannelIDs.BotSpam)}${comfyVibesMessage}`;

    if (this.interaction.deferred || this.interaction.replied) this.interaction.editReply({ content });
    else this.interaction.reply({ content, ephemeral: true });
  }

  protected checkChannelEligibility(botSpam: boolean, comfyVibes: boolean) {
    const channelIsBotSpam = this.commandRanInBotSpam();
    const channelIsComfyVibes = this.commandRanInComfyVibes();
    const executorIsModerator = this.commandRanByModerator();

    if (executorIsModerator) return true;
    else if (botSpam && comfyVibes) return channelIsBotSpam || channelIsComfyVibes;
    else if (botSpam) return channelIsBotSpam;
    else if (comfyVibes) return channelIsComfyVibes;
    else return false;
  }

  private commandRanByModerator() {
    const memberPermissions = this.interaction.memberPermissions;
    if (!memberPermissions) return false;

    return memberPermissions.has('BanMembers');
  }

  private commandRanInBotSpam() {
    return this.interaction.channelId === ChannelIDs.BotSpam;
  }

  private commandRanInComfyVibes() {
    return this.interaction.channelId === ChannelIDs.ComfyVibes;
  }
}
