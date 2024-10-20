import { client } from '@base';
import { PrismaClient } from '@prisma/client';
import { ButtonInteraction, ChatInputCommandInteraction, ColorResolvable, Colors, EmbedBuilder, Guild, TextChannel } from 'discord.js';
import { styleLog } from './utilities.js';

export const database = new PrismaClient();
export const xpCooldownCache: { [userID: string]: number; } = {};
export const akialytesGuild = await client.guilds.fetch(process.env.AKIALYTES_GUILD_ID ?? '');
export const EmbedColours = {
  Positive: Colors.Green,
  Neutral: Colors.Blue,
  Negative: Colors.Red,
  Info: Colors.Purple,
};
export const Emotes = {
  Bonque: '<:akiaBonque:1072610966598066237>',
  Arson: '<a:arson:1010942526976430191>',
  Error: '<:error:1023986711971242054>',
  Added: '<:added:1113169938933358592>',
  Removed: '<:removed:1113169940858556487>',
  Thinking: '<:Thinking:1263844433091362918>'
};
export const Images = {
  WatchedUser: 'https://cdn.discordapp.com/attachments/1010934331725852723/1254528002708996217/alert.png?ex=6679d1bf&is=6678803f&hm=4cdeec033e6d945b910f8975200f70fed4c9d5133e4d07add2be79223023421c&'
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
