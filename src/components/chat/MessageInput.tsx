import { useState, useRef, type KeyboardEvent, type ChangeEvent, type FormEvent } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { authorAtom, sendingAtom, sendMessageAtom } from '../../atoms/chatAtoms';
import { Spinner } from '../ui/Spinner';
import styles from './MessageInput.module.css';

const MAX_LENGTH = 500;

export function MessageInput() {
  const author = useAtomValue(authorAtom);
  const sending = useAtomValue(sendingAtom);
  const sendMessage = useSetAtom(sendMessageAtom);

  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && !sending;

  async function handleSubmit(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (!canSend) return;

    const message = text.trim();
    setText('');

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    await sendMessage({ author, message });
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    setText(el.value);
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Send a message"
    >
      <label htmlFor="message-input" className={styles.srOnly}>
        Message
      </label>
      <textarea
        id="message-input"
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Message"
        className={styles.textarea}
        rows={1}
        maxLength={MAX_LENGTH}
        disabled={sending}
        aria-disabled={sending}
        autoFocus
      />

      <button
        type="submit"
        disabled={!canSend}
        className={styles.sendButton}
        aria-label="Send message"
      >
        {sending ? <Spinner size="sm" aria-hidden /> : 'Send'}
      </button>

      <span role="status" className={styles.srOnly}>
        {sending ? 'Sending message' : ''}
      </span>
    </form>
  );
}
