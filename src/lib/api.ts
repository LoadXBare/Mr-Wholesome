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


// === Ban Modal Data ===

const banModalDataKeyV = new Keyv('sqlite://data.sqlite', { namespace: 'banModalData' });

async function banModalDataGet(modalInteractionID: string) {
  const data = await banModalDataKeyV.get(modalInteractionID) as { userID: string, delete_messages: number, notify_user: boolean; } | undefined;
  return data;
}

async function banModalDataSet(modalInteractionID: string, userID: string, delete_messages: number, notify_user: boolean) {
  const result = await banModalDataKeyV.set(modalInteractionID, { userID, delete_messages, notify_user });
  return result;
}

async function banModalDataDel(modalInteractionID: string) {
  const result = await banModalDataKeyV.delete(modalInteractionID);
  return result;
}

export const banModalData = {
  get: banModalDataGet,
  set: banModalDataSet,
  del: banModalDataDel
};


// === Warn Modal Data ===

const warnModalDataKeyV = new Keyv('sqlite://data.sqlite', { namespace: 'warnModalData' });

async function warnModalDataGet(modalInteractionID: string) {
  const data = await warnModalDataKeyV.get(modalInteractionID) as { userID: string, notify_user: boolean; } | undefined;
  return data;
}

async function warnModalDataSet(modalInteractionID: string, userID: string, notify_user: boolean) {
  const result = await warnModalDataKeyV.set(modalInteractionID, { userID, notify_user });
  return result;
}

async function warnModalDataDel(modalInteractionID: string) {
  const result = await warnModalDataKeyV.delete(modalInteractionID);
  return result;
}

export const warnModalData = {
  get: warnModalDataGet,
  set: warnModalDataSet,
  del: warnModalDataDel
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
