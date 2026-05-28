import { atom, type Setter } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Message, SendPayload } from '../types/message';
import { getMessages, postMessage } from '../lib/api';

export const messagesAtom = atom<Message[]>([]);
export const loadingAtom = atom<boolean>(false);
export const sendingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);
const failedMessagesAtom = atom<Message[]>([]);

export const authorAtom = atomWithStorage<string>('chat-author', '');

export const fetchMessagesAtom = atom(
  null,
  async (get, set) => {
    if (get(messagesAtom).length === 0) set(loadingAtom, true);

    try {
      const data = await getMessages();
      set(messagesAtom, [...data]);
      if (get(failedMessagesAtom).length > 0) {
        set(messagesAtom, (prev) => [...prev, ...get(failedMessagesAtom)]);
        set(failedMessagesAtom, []);
      }
      set(errorAtom, null);
    } catch (err) {
      set(errorAtom, err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      set(loadingAtom, false);
    }
  }
);

const getFailedMessage = (author: string, message: string): Message => ({
  _id: crypto.randomUUID(),
  author,
  message,
  createdAt: new Date().toISOString(),
  failed: true,
});

const spliceMessage = (prev: Message[], failedMsg: Message, retryId?: string) => {
  const withoutRetried = retryId ? prev.filter((msg) => msg._id !== retryId) : prev;
  return [...withoutRetried, failedMsg];
};

const trackFailedMessage = (set: Setter, failedMsg: Message, retryId?: string) => {
  set(messagesAtom, (prev) => spliceMessage(prev, failedMsg, retryId));
  set(failedMessagesAtom, (prev) => spliceMessage(prev, failedMsg, retryId));
};

export const sendMessageAtom = atom(
  null,
  async (_get, set, { author, message, retryId }: SendPayload) => {
    set(sendingAtom, true);
    set(errorAtom, null);

    if (!navigator.onLine) {
      trackFailedMessage(set, getFailedMessage(author, message), retryId);
      set(errorAtom, 'No internet connection');
      set(sendingAtom, false);
      return;
    }

    try {
      const newMsg = await postMessage(author, message);
      set(messagesAtom, (prev) => {
        const withoutRetried = retryId ? prev.filter((msg) => msg._id !== retryId) : prev;
        return [...withoutRetried, newMsg];
      });
      if (retryId) {
        set(failedMessagesAtom, (prev) => prev.filter((msg) => msg._id !== retryId));
      }
    } catch (err) {
      trackFailedMessage(set, getFailedMessage(author, message), retryId);
      set(errorAtom, err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      set(sendingAtom, false);
    }
  }
);

export const clearErrorAtom = atom(null, (_get, set) => {
  set(errorAtom, null);
});
