import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Message, SendPayload } from '../types/message';
import { getMessages, postMessage } from '../lib/api';

export const messagesAtom = atom<Message[]>([]);
export const loadingAtom = atom<boolean>(false);
export const sendingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);

export const authorAtom = atomWithStorage<string>('chat-author', '');

export const fetchMessagesAtom = atom(
  null,
  async (get, set) => {
    if (get(messagesAtom).length === 0) set(loadingAtom, true);

    try {
      const data = await getMessages();
      console.log('data', data);
      set(messagesAtom, [...data]);
      set(errorAtom, null);
    } catch (err) {
      set(errorAtom, err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      set(loadingAtom, false);
    }
  }
);

export const sendMessageAtom = atom(
  null,
  async (_get, set, { author, message }: SendPayload) => {
    set(sendingAtom, true);
    set(errorAtom, null);

    try {
      const newMsg = await postMessage(author, message);
      set(messagesAtom, (prev) => [...prev, newMsg]);
    } catch (err) {
      set(errorAtom, err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      set(sendingAtom, false);
    }
  }
);

export const clearErrorAtom = atom(null, (_get, set) => {
  set(errorAtom, null);
});
