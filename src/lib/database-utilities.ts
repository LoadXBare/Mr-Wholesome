import { database } from "../lib/config.js";

/**
 * Checks whether a channel has events ignored in the specified guild.
 * @param guildID The ID of the guild the channel is in
 * @param channelID The ID of the channel to check
 * @returns True if the channel has events ignored, or false otherwise
 */
export async function channelIgnoresEvents(guildID: string | null, channelID: string | null) {
  if (!guildID || !channelID) return true;

  const guildConfig = await database.guildConfig.findUnique({
    where: { guildID },
  }).catch(() => null);

  const eventIgnoredChannelIDs = guildConfig?.eventIgnoredChannelIDs.split(',') ?? [];
  return eventIgnoredChannelIDs.includes(channelID);
}
