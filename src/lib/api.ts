import Keyv from "keyv";

const buttonDataKeyV = new Keyv('sqlite://data.sqlite', { namespace: 'buttonData' });

async function levelNotifButtonDataGet(messageID: string) {
  const data = await buttonDataKeyV.get(messageID) as { ownerID: string, levelNotifState: boolean; } | undefined;
  return data;
}

async function levelNotifButtonDataSet(messageID: string, ownerID: string, levelNotifState: boolean) {
  const result = await buttonDataKeyV.set(messageID, { ownerID, levelNotifState });
  return result;
}

async function levelNotifButtonDataDel(messageID: string) {
  const result = await buttonDataKeyV.delete(messageID);
  return result;
}

export const levelNotifButtonData = {
  get: levelNotifButtonDataGet,
  set: levelNotifButtonDataSet,
  del: levelNotifButtonDataDel
};