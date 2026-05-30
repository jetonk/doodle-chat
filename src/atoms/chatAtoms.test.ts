import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import {
  messagesAtom, loadingAtom, errorAtom, hasMoreAtom, sendingAtom,
  visibleMessagesAtom, fetchMessages, loadEarlier, sendMessage, clearError,
} from './chatAtoms';
import * as api from '../lib/api';
import type { Message } from '../types/message';

vi.mock('../lib/api');

const msg = (overrides: Partial<Message> = {}): Message => ({
  _id: crypto.randomUUID(),
  author: 'Alice',
  message: 'Hello',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

let store: ReturnType<typeof createStore>;

beforeEach(() => {
  store = createStore();
  vi.resetAllMocks();
});

// ─── visibleMessagesAtom ──────────────────────────────────────────────────────

describe('visibleMessagesAtom', () => {
  it('pins failed messages after real ones', () => {
    const real = msg({ _id: 'r' });
    const failed = msg({ _id: 'f', failed: true });
    store.set(messagesAtom, [failed, real]);
    const visible = store.get(visibleMessagesAtom);
    expect(visible[0]._id).toBe('r');
    expect(visible[1]._id).toBe('f');
  });

  it('returns only real messages when there are no failed ones', () => {
    const a = msg({ _id: 'a' });
    const b = msg({ _id: 'b' });
    store.set(messagesAtom, [a, b]);
    expect(store.get(visibleMessagesAtom)).toEqual([a, b]);
  });
});

// ─── fetchMessages ────────────────────────────────────────────────────────────

describe('fetchMessages', () => {
  it('populates messages on initial load', async () => {
    const messages = [msg()];
    vi.mocked(api.getMessages).mockResolvedValueOnce(messages);
    await fetchMessages(store);
    expect(store.get(messagesAtom)).toEqual(messages);
    expect(store.get(loadingAtom)).toBe(false);
  });

  it('sets hasMore false when page is shorter than PAGE_SIZE', async () => {
    vi.mocked(api.getMessages).mockResolvedValueOnce([msg()]);
    await fetchMessages(store);
    expect(store.get(hasMoreAtom)).toBe(false);
  });

  it('dedupes messages on subsequent polls', async () => {
    const existing = msg({ _id: 'existing' });
    const fresh = msg({ _id: 'fresh', createdAt: '2024-01-02T00:00:00.000Z' });
    store.set(messagesAtom, [existing]);
    vi.mocked(api.getMessages).mockResolvedValueOnce([existing, fresh]);
    await fetchMessages(store);
    expect(store.get(messagesAtom).filter(m => m._id === 'existing')).toHaveLength(1);
  });

  it('sets error on API failure', async () => {
    vi.mocked(api.getMessages).mockRejectedValueOnce(new Error('Network error'));
    await fetchMessages(store);
    expect(store.get(errorAtom)).toBe('Network error');
    expect(store.get(loadingAtom)).toBe(false);
  });
});

// ─── loadEarlier ─────────────────────────────────────────────────────────────

describe('loadEarlier', () => {
  it('prepends older messages', async () => {
    const recent = msg({ _id: 'recent', createdAt: '2024-01-02T00:00:00.000Z' });
    const older = msg({ _id: 'older', createdAt: '2024-01-01T00:00:00.000Z' });
    store.set(messagesAtom, [recent]);
    vi.mocked(api.getMessages).mockResolvedValueOnce([older]);
    await loadEarlier(store);
    expect(store.get(messagesAtom)[0]._id).toBe('older');
  });

  it('sets hasMore false when no more pages', async () => {
    store.set(messagesAtom, [msg()]);
    vi.mocked(api.getMessages).mockResolvedValueOnce([]);
    await loadEarlier(store);
    expect(store.get(hasMoreAtom)).toBe(false);
  });
});

// ─── sendMessage ─────────────────────────────────────────────────────────────

describe('sendMessage', () => {
  it('adds the confirmed message on success', async () => {
    const sent = msg({ _id: 'sent', message: 'Hi!' });
    vi.mocked(api.postMessage).mockResolvedValueOnce(sent);
    vi.mocked(api.getMessages).mockResolvedValue([]);
    await sendMessage({ author: 'Alice', message: 'Hi!' }, store);
    expect(store.get(messagesAtom).some(m => m._id === 'sent')).toBe(true);
    expect(store.get(sendingAtom)).toBe(false);
  });

  it('creates a failed placeholder when offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
    await sendMessage({ author: 'Alice', message: 'Hi!' }, store);
    expect(store.get(messagesAtom).some(m => m.failed)).toBe(true);
    expect(store.get(errorAtom)).toBe('No internet connection');
  });

  it('creates a failed placeholder on API error', async () => {
    vi.mocked(api.postMessage).mockRejectedValueOnce(new Error('Server error'));
    await sendMessage({ author: 'Alice', message: 'Hi!' }, store);
    expect(store.get(messagesAtom).some(m => m.failed)).toBe(true);
    expect(store.get(errorAtom)).toBe('Server error');
  });
});

// ─── clearError ──────────────────────────────────────────────────────────────

describe('clearError', () => {
  it('clears the error', () => {
    store.set(errorAtom, 'something went wrong');
    clearError(store);
    expect(store.get(errorAtom)).toBeNull();
  });
});
