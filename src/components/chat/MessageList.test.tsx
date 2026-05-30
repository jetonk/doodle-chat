import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { createStore } from 'jotai';
import { messagesAtom, loadingAtom, errorAtom, clearError } from '../../atoms/chatAtoms';
import { MessageList } from './MessageList';
import type { Message } from '../../types/message';

vi.mock('../../atoms/chatAtoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../atoms/chatAtoms')>();
  return { ...actual, fetchMessages: vi.fn(), clearError: vi.fn() };
});

const msg = (overrides: Partial<Message> = {}): Message => ({
  _id: '1',
  author: 'Alice',
  message: 'Hello',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

const renderWithStore = (store: ReturnType<typeof createStore>) =>
  render(<Provider store={store}><MessageList /></Provider>);

describe('MessageList', () => {
  it('shows a spinner while loading', () => {
    const store = createStore();
    store.set(loadingAtom, true);
    renderWithStore(store);
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
  });

  it('renders messages', () => {
    const store = createStore();
    store.set(messagesAtom, [msg({ message: 'Hello world' })]);
    renderWithStore(store);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('shows empty state when there are no messages', () => {
    const store = createStore();
    renderWithStore(store);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('shows error banner and calls clearError on dismiss', async () => {
    const store = createStore();
    store.set(errorAtom, 'Something went wrong');
    renderWithStore(store);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(clearError).toHaveBeenCalled();
  });
});
