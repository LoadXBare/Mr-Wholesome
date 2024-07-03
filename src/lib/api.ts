import Keyv from "keyv";

// === Button Data ===

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


// === Birthday Scheduler ===

const birthdayCheckKeyV = new Keyv('sqlite://data.sqlite', { namespace: 'birthdayCheck' });

async function lastBirthdayCheckGet() {
  const data = await birthdayCheckKeyV.get('lastBirthdayCheck') as number | undefined;
  return data;
}

async function lastBirthdayCheckSet(date: number) {
  const result = await birthdayCheckKeyV.set('lastBirthdayCheck', date);
  return result;
}

export const lastBirthdayCheck = {
  get: lastBirthdayCheckGet,
  set: lastBirthdayCheckSet
};
