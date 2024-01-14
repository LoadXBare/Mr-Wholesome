import { PrismaClient } from '@prisma/client';
import { TextChannel } from 'discord.js';
import client from '../index.js';

export const database = new PrismaClient();
export enum EmbedColours {
  Positive = 'Green',
  Neutral = 'Blue',
  Negative = 'Red',
  Success = 'Green',
  Info = 'Purple',
  Error = 'Red',
}
export enum Discord {
  MAX_ATTACHMENT_SIZE = 15_000_000, // The actual Non-Nitro max upload size is 25MB, but uploads that big can cause bot to timeout
}
export enum Emotes {
  Bonque = '<:akiaBonque:1072610966598066237>',
  Arson = '<a:arson:1010942526976430191>',
  Error = '<:error:1023986711971242054>',
  Added = '<:added:1113169938933358592>',
  Removed = '<:removed:1113169940858556487>',
}

export class EventHandler {
  get logChannel() {
    return client.channels.resolve(process.env.MODERATION_LOGS_CHANNEL_ID ?? '') as TextChannel;
  }
}
