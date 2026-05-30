import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'jotai';
import { createStore } from 'jotai';
import { authorAtom } from '../../atoms/authAtoms';
import { AuthorModal } from './AuthorModal';

let store: ReturnType<typeof createStore>;

beforeEach(() => {
  localStorage.clear();
  store = createStore();
});

const renderModal = () =>
  render(<Provider store={store}><AuthorModal /></Provider>);

describe('AuthorModal', () => {
  it('renders the modal when no author is set', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when author is already set', () => {
    store.set(authorAtom, 'Alice');
    renderModal();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('disables submit button when input is empty', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /start chatting/i })).toBeDisabled();
  });

  it('enables submit button when input has text', async () => {
    renderModal();
    await userEvent.type(screen.getByRole('textbox'), 'Alice');
    expect(screen.getByRole('button', { name: /start chatting/i })).toBeEnabled();
  });

  it('sets the author on submit', async () => {
    renderModal();
    await userEvent.type(screen.getByRole('textbox'), 'Alice');
    await userEvent.click(screen.getByRole('button', { name: /start chatting/i }));
    expect(store.get(authorAtom)).toBe('Alice');
  });

  it('trims whitespace from the name', async () => {
    renderModal();
    await userEvent.type(screen.getByRole('textbox'), '  Alice  ');
    await userEvent.click(screen.getByRole('button', { name: /start chatting/i }));
    expect(store.get(authorAtom)).toBe('Alice');
  });
});
