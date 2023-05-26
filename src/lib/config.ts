import { PrismaClient } from "@prisma/client";
import { GatewayIntentBits } from "discord.js";
const { Guilds, GuildMembers, GuildMessages, MessageContent, GuildModeration } = GatewayIntentBits;

export const Intents = [Guilds, GuildMembers, GuildMessages, MessageContent, GuildModeration];
export const database = new PrismaClient();
export enum BotColors {
    Positive = 'Green',
    Neutral = '#2b2d31',
    Negative = 'Red',
    Success = 'Green',
    Info = 'Purple',
    Error = 'Red'
}
export enum Discord {
    MAX_ATTACHMENT_SIZE = 15_000_000 // The actual Non-Nitro max upload size is 25MB, but uploads that big can cause bot to timeout
}
export enum Emotes {
    Bonque = '<:akiaBonque:876905175565086720>',
    Arson = '<a:arson:1010942526976430191>',
    Error = '<:error:1023986711971242054>'
}
export enum UserIDs {
    BotOwner = '455321156224942091',
    Akialyne = '263104208079814656'
}
export enum ChannelIDs {
    MediaStorage = '1010934331725852723',
    Memes = '812670586916569098'
}