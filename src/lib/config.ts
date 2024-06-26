import { PrismaClient } from '@prisma/client';
import { TextChannel } from 'discord.js';
import client from '../index.js';

export const database = new PrismaClient();
export const buttonDataCache: { [messageID: string]: any; } = {};
export const xpCooldownCache: { [userID: string]: number; } = {};
export enum EmbedColours {
  Positive = 'Green',
  Neutral = 'Blue',
  Negative = 'Red',
  Success = 'Green',
  Info = 'Purple',
  Error = 'Red',
}
export enum Discord {
  MAX_ATTACHMENT_SIZE = 15_000_000, // The actual Non-Nitro max upload size is higher, but uploads that big can cause bot to timeout
}
export enum Emotes {
  Bonque = '<:akiaBonque:1072610966598066237>',
  Arson = '<a:arson:1010942526976430191>',
  Error = '<:error:1023986711971242054>',
  Added = '<:added:1113169938933358592>',
  Removed = '<:removed:1113169940858556487>',
}
export enum Images {
  WatchedUser = 'https://cdn.discordapp.com/attachments/1010934331725852723/1254528002708996217/alert.png?ex=6679d1bf&is=6678803f&hm=4cdeec033e6d945b910f8975200f70fed4c9d5133e4d07add2be79223023421c&'
}
export const UserIDs = {
  Bot: process.env.BOT_ID ?? '',
  BotOwner: process.env.BOT_OWNER_ID ?? '',
  Akialyne: process.env.AKIALYNE_USER_ID ?? '',
};
export const ChannelIDs = {
  Birthday: process.env.BIRTHDAY_CHANNEL_ID ?? '',
  MediaStorage: process.env.MEDIA_STORAGE_CHANNEL_ID ?? '',
  Memes: process.env.MEMES_CHANNEL_ID ?? '',
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
