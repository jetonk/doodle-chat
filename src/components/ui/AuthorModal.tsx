import { type SubmitEvent, useState } from 'react';
import styles from './AuthorModal.module.css';

export function AuthorModal() {
  const [author, setAuthor] = useState<string>('');

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    console.log('draft message', author);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.card}>
        <h1 id="modal-title" className={styles.title}>Welcome to Doodle Chat</h1>
        <p className={styles.subtitle}>Choose a name to start chatting</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="author-input" className={styles.label}>
            Your name
          </label>
          <input
            id="author-input"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. Jane Smith"
            className={styles.input}
            maxLength={50}
            autoComplete="name"
          />
          <button
            type="submit"
            disabled={!author.trim()}
            className={styles.button}
          >
            Start chatting
          </button>
        </form>
      </div>
    </div>
  );
}
