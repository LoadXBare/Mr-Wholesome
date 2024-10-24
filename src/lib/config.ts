import { client } from '@base';
import { PrismaClient } from '@prisma/client';
import { ButtonInteraction, ChatInputCommandInteraction, ColorResolvable, Colors, EmbedBuilder, Guild, TextChannel } from 'discord.js';
import { styleLog } from './utilities.js';

export const database = new PrismaClient();
export const xpCooldownCache: { [userID: string]: number; } = {};
export const akialytesGuild = await client.guilds.fetch(process.env.AKIALYTES_GUILD_ID ?? '');
export const EmbedColours = {
  Positive: Colors.Green,
  Neutral: Colors.Aqua,
  Negative: Colors.Red,
  Info: Colors.Purple,
};
export const baseEmbed = new EmbedBuilder().setColor(EmbedColours.Neutral).toJSON();
export const Emotes = {
  Bonque: '<:akiaBonque:1072610966598066237>',
  Arson: '<a:arson:1010942526976430191>',
  Error: '<:error:1023986711971242054>',
  Added: '<:added:1113169938933358592>',
  Removed: '<:removed:1113169940858556487>',
  Thinking: '<:Thinking:1263844433091362918>'
};
export const Images = {
  WatchedUser: 'https://cdn.discordapp.com/attachments/1297278175046533247/1298572168338083930/ic_fluent_person_note_24_filled.png?ex=671a0d13&is=6718bb93&hm=b494bb3f608a08225c554c78b37fe61e37fe3e116f90814ed29c7c3067f900f5&'
};
export const UserIDs = {
  Bot: process.env.BOT_ID ?? '',
  Akialyne: process.env.AKIALYNE_USER_ID ?? '',
};
export const ChannelIDs = {
  Birthday: process.env.BIRTHDAY_CHANNEL_ID ?? '',
  Memes: process.env.MEMES_CHANNEL_ID ?? '',
  ComfyVibes: process.env.COMFY_VIBES_CHANNEL_ID ?? '',
  BotSpam: process.env.BOT_SPAM_CHANNEL_ID ?? '',
  ModerationLogs: process.env.MODERATION_LOGS_CHANNEL_ID ?? '',
  LevelUp: process.env.LEVEL_UP_CHANNEL_ID ?? '',
};
export const RoleIDs = {
  Akialyte: process.env.AKIALYTE_ROLE_ID ?? '',
  Birthday: process.env.BIRTHDAY_ROLE_ID ?? '',
};
export const GuildIDs = {
  BotTesting: process.env.BOT_TESTING_GUILD_ID ?? '',
  Akialytes: process.env.AKIALYTES_GUILD_ID ?? '',
};
export class EventHandler {
  get logChannel() {
    return client.channels.resolve(process.env.MODERATION_LOGS_CHANNEL_ID ?? '') as TextChannel;
  }
}
export abstract class BaseInteractionHandler {
  private baseInteraction: ButtonInteraction | ChatInputCommandInteraction;
  protected guild: Guild;

  constructor(interaction: ButtonInteraction | ChatInputCommandInteraction) {
    this.baseInteraction = interaction;
    this.guild = interaction.guild!;
  }

  protected abstract handle(): Promise<void>;

  protected simpleEmbed(description: string, colour: ColorResolvable = EmbedColours.Info) {
    return new EmbedBuilder().setDescription(description).setColor(colour);
  }

  protected async handleError(error: string, log: boolean = false, filename?: string) {
    if (log && !filename) {
      throw new Error("Filename must be provided if logging is enabled");
    }

    const options = { embeds: [this.simpleEmbed(`❌ ${error}`, EmbedColours.Negative)] };

    if (this.baseInteraction.replied || this.baseInteraction.deferred) {
      await this.baseInteraction.editReply(options);
    } else {
      await this.baseInteraction.reply(options);
    }

    if (log && filename) {
      styleLog(error, false, filename);
    }
  }

}
