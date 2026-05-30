import { atom, useAtomValue } from 'jotai';
import type { Message, SendPayload } from '../types/message';
import { getMessages, postMessage } from '../lib/api';
import { store as defaultStore } from './store';
import type { AppStore } from './store';

const PAGE_SIZE = 20;
const POLL_LIMIT = 50;

// ─── STATE ───────────────────────────────────────────────────────────────────

export const messagesAtom = atom<Message[]>([]);
export const loadingAtom = atom<boolean>(false);
export const loadingEarlierAtom = atom<boolean>(false);
export const sendingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);

const pollCursorAtom = atom<string | null>(null);

export const hasMoreAtom = atom<boolean>(true);

// ─── DERIVED ─────────────────────────────────────────────────────────────────

export const visibleMessagesAtom = atom((get) => {
  const all = get(messagesAtom);
  const real = all.filter((m) => !m.failed);
  const failed = all.filter((m) => m.failed);
  return failed.length ? [...real, ...failed] : real;
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const toErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

const splitByStatus = (msgs: Message[]) => {
  const real: Message[] = [];
  const failed: Message[] = [];
  for (const m of msgs) (m.failed ? failed : real).push(m);
  return { real, failed };
};

const upsertMessages = (prev: Message[], incoming: Message[]): Message[] => {
  const { real, failed } = splitByStatus(prev);
  const byId = new Map(real.map((m) => [m._id, m]));
  let changed = false;
  for (const m of incoming) {
    if (!byId.has(m._id)) changed = true;
    byId.set(m._id, m);
  }
  if (!changed) return prev;
  const merged = [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return failed.length ? [...merged, ...failed] : merged;
};

const createFailedPlaceholder = (author: string, message: string): Message => ({
  _id: crypto.randomUUID(),
  author,
  message,
  createdAt: new Date().toISOString(),
  failed: true,
});

// ─── ACTIONS ─────────────────────────────────────────────────────────────────

export async function fetchMessages(store: AppStore = defaultStore) {
  if (store.get(loadingAtom)) return;

  const cursor = store.get(pollCursorAtom);
  const isInitial = cursor === null;

  if (isInitial) store.set(loadingAtom, true);

  try {
    const data = isInitial
      ? await getMessages({ before: new Date().toISOString(), limit: PAGE_SIZE })
      : await getMessages({ after: cursor, limit: POLL_LIMIT });

    if (data.length > 0) {
      store.set(messagesAtom, (prev) => upsertMessages(prev, data));
      const newest = data.at(-1)?.createdAt;
      if (newest) store.set(pollCursorAtom, (c) => (c && c >= newest ? c : newest));
    }

    if (isInitial) store.set(hasMoreAtom, data.length === PAGE_SIZE);
    store.set(errorAtom, null);
  } catch (err) {
    store.set(errorAtom, toErrorMessage(err, 'Failed to load messages'));
  } finally {
    if (isInitial) store.set(loadingAtom, false);
  }
}

export async function loadEarlier(store: AppStore = defaultStore) {
  if (store.get(loadingEarlierAtom) || !store.get(hasMoreAtom)) return;

  const oldest = store.get(messagesAtom).find((m) => !m.failed)?.createdAt;
  if (!oldest) return;

  store.set(loadingEarlierAtom, true);
  try {
    const older = await getMessages({ before: oldest, limit: PAGE_SIZE });
    if (older.length > 0) store.set(messagesAtom, (prev) => upsertMessages(prev, older));
    store.set(hasMoreAtom, older.length === PAGE_SIZE);
    store.set(errorAtom, null);
  } catch (err) {
    store.set(errorAtom, toErrorMessage(err, 'Failed to load earlier messages'));
  } finally {
    store.set(loadingEarlierAtom, false);
  }
}

export async function sendMessage({ author, message, retryId }: SendPayload, store: AppStore = defaultStore) {
  store.set(sendingAtom, true);
  store.set(errorAtom, null);

  const markAsFailed = () => {
    const placeholder = createFailedPlaceholder(author, message);
    store.set(messagesAtom, (prev) => {
      const without = retryId ? prev.filter((m) => m._id !== retryId) : prev;
      return [...without, placeholder];
    });
  };

  if (!navigator.onLine) {
    markAsFailed();
    store.set(errorAtom, 'No internet connection');
    store.set(sendingAtom, false);
    return;
  }

  try {
    const newMsg = await postMessage(author, message);
    if (retryId) store.set(messagesAtom, (prev) => prev.filter((m) => m._id !== retryId));
    store.set(messagesAtom, (prev) => upsertMessages(prev, [newMsg]));
    if (!store.get(loadingAtom)) fetchMessages(store);
  } catch (err) {
    markAsFailed();
    store.set(errorAtom, toErrorMessage(err, 'Failed to send message'));
  } finally {
    store.set(sendingAtom, false);
  }
}

export function clearError(store: AppStore = defaultStore) {
  store.set(errorAtom, null);
}


export function useChatState() {
  return {
    messages: useAtomValue(visibleMessagesAtom),
    loading: useAtomValue(loadingAtom),
    error: useAtomValue(errorAtom),
    hasMore: useAtomValue(hasMoreAtom),
    loadingEarlier: useAtomValue(loadingEarlierAtom),
  };
}