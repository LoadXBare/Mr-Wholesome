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


// === Ticket Panel Modal Data ===

const ticketPanelModalDataKeyV = new Keyv('sqlite://data.sqlite', { namespace: 'ticketPanelModalData' });

async function ticketPanelModalDataGet(modalInteractionID: string) {
  const data = await ticketPanelModalDataKeyV.get(modalInteractionID) as { name: string, categoryID: string, moderatorRoleID: string; } | undefined;
  return data;
}

async function ticketPanelModalDataSet(modalInteractionID: string, name: string, categoryID: string, moderatorRoleID: string) {
  const result = await ticketPanelModalDataKeyV.set(modalInteractionID, { name, categoryID, moderatorRoleID });
  return result;
}

async function ticketPanelModalDataDel(modalInteractionID: string) {
  const result = await ticketPanelModalDataKeyV.delete(modalInteractionID);
  return result;
}

export const ticketPanelModalData = {
  get: ticketPanelModalDataGet,
  set: ticketPanelModalDataSet,
  del: ticketPanelModalDataDel
};

// === Watchlist Modal Data ===

const watchlistModalDataKeyV = new Keyv('sqlite://data.sqlite', { namespace: 'watchlistModalData' });

async function watchlistModalDataGet(modalInteractionID: string) {
  const data = await watchlistModalDataKeyV.get(modalInteractionID) as { userID: string; } | undefined;
  return data;
}

async function watchlistModalDataSet(modalInteractionID: string, userID: string) {
  const result = await watchlistModalDataKeyV.set(modalInteractionID, { userID });
  return result;
}

async function watchlistModalDataDel(modalInteractionID: string) {
  const result = await watchlistModalDataKeyV.delete(modalInteractionID);
  return result;
}

export const watchlistModalData = {
  get: watchlistModalDataGet,
  set: watchlistModalDataSet,
  del: watchlistModalDataDel
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
// keyv sqlite is bloated, just move these to prisma db