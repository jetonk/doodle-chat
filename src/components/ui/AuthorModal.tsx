import { type SubmitEvent, useState } from 'react';
import { useAtom } from 'jotai';
import { authorAtom } from '../../atoms/authAtoms';
import styles from './AuthorModal.module.css';

export function AuthorModal() {
  const [author, setAuthor] = useAtom(authorAtom);
  const [draft, setDraft] = useState('');


  if (author) return null;

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const name = draft.trim();
    if (name) setAuthor(name);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-subtitle">
      <div className={styles.card}>
        <h1 id="modal-title" className={styles.title}>Welcome to Doodle Chat</h1>
        <p id="modal-subtitle" className={styles.subtitle}>Choose a name to start chatting</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="author-input" className={styles.label}>
            Your name
          </label>
          <input
            id="author-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Jane Smith"
            className={styles.input}
            maxLength={50}
            autoComplete="name"
            autoFocus
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className={styles.button}
          >
            Start chatting
          </button>
        </form>
      </div>
    </div>
  );
}
