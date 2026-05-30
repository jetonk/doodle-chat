import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { createStore } from 'jotai';
import { authorAtom } from '../../atoms/authAtoms';
import { sendingAtom } from '../../atoms/chatAtoms';
import * as chatAtoms from '../../atoms/chatAtoms';
import { MessageInput } from './MessageInput';

vi.mock('../../atoms/chatAtoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../atoms/chatAtoms')>();
  return { ...actual, sendMessage: vi.fn() };
});

let store: ReturnType<typeof createStore>;

beforeEach(() => {
  localStorage.clear();
  store = createStore();
  store.set(authorAtom, 'Alice');
  vi.resetAllMocks();
});

const renderInput = () =>
  render(<Provider store={store}><MessageInput /></Provider>);

describe('MessageInput', () => {
  it('disables the send button when textarea is empty', () => {
    renderInput();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });

  it('enables the send button when textarea has text', async () => {
    renderInput();
    await userEvent.type(screen.getByRole('textbox'), 'Hello');
    expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled();
  });

  it('calls sendMessage and clears the input on submit', async () => {
    renderInput();
    await userEvent.type(screen.getByRole('textbox'), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(chatAtoms.sendMessage).toHaveBeenCalledWith({ author: 'Alice', message: 'Hello' });
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('submits on Enter key', async () => {
    renderInput();
    await userEvent.type(screen.getByRole('textbox'), 'Hello');
    await userEvent.keyboard('{Enter}');
    expect(chatAtoms.sendMessage).toHaveBeenCalledWith({ author: 'Alice', message: 'Hello' });
  });

  it('does not submit on Shift+Enter', async () => {
    renderInput();
    await userEvent.type(screen.getByRole('textbox'), 'Hello');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    expect(chatAtoms.sendMessage).not.toHaveBeenCalled();
  });

  it('disables input and button while sending', () => {
    store.set(sendingAtom, true);
    renderInput();
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: /send message/i })).toBeDisabled();
  });
});
