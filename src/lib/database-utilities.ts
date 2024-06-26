import { database } from "./config.js";

/**
 * Checks whether a channel has events ignored in the specified guild.
 * @param guildID The ID of the guild the channel is in
 * @param channelID The ID of the channel to check
 * @returns True if the channel has events ignored, or false otherwise
 */
export async function channelIgnoresEvents(guildID: string | null, channelID: string | null) {
  if (guildID === null || channelID === null) return true;

  const guildConfig = await database.guildConfig.findFirst({
    where: { guildID },
  });
  // .catch((e) => log('An error occurred while fetching from the database!', false, e));

  const eventIgnoredChannelIDs = guildConfig?.eventIgnoredChannelIDs.split(',') ?? [];
  return eventIgnoredChannelIDs.includes(channelID);
}
