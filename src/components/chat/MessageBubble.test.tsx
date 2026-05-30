import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubble } from './MessageBubble';
import * as chatAtoms from '../../atoms/chatAtoms';
import type { Message } from '../../types/message';

vi.mock('../../atoms/chatAtoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../atoms/chatAtoms')>();
  return { ...actual, sendMessage: vi.fn() };
});

const msg = (overrides: Partial<Message> = {}): Message => ({
  _id: '1',
  author: 'Alice',
  message: 'Hello',
  createdAt: '2024-01-01T10:00:00.000Z',
  ...overrides,
});

beforeEach(() => vi.resetAllMocks());

describe('MessageBubble', () => {
  it('renders the message text', () => {
    render(<MessageBubble message={msg({ message: 'Hello world' })} isOwn={false} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('shows author name for messages from others', () => {
    render(<MessageBubble message={msg({ author: 'Bob' })} isOwn={false} />);
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('hides author name for own messages', () => {
    render(<MessageBubble message={msg({ author: 'Alice' })} isOwn={true} />);
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });

  it('shows retry button for failed messages', () => {
    render(<MessageBubble message={msg({ failed: true })} isOwn={true} />);
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('hides retry button for normal messages', () => {
    render(<MessageBubble message={msg()} isOwn={true} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls sendMessage with retryId on retry click', async () => {
    const message = msg({ _id: 'abc', author: 'Alice', message: 'Hi', failed: true });
    render(<MessageBubble message={message} isOwn={true} />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(chatAtoms.sendMessage).toHaveBeenCalledWith({
      author: 'Alice',
      message: 'Hi',
      retryId: 'abc',
    });
  });
});
