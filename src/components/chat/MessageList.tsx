import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { messagesAtom, loadingAtom, errorAtom, authorAtom, fetchMessagesAtom, clearErrorAtom } from '../../atoms/chatAtoms';
import { POLL_INTERVAL_MS } from '../../lib/constants';
import { MessageBubble } from './MessageBubble';
import { Spinner } from '../ui/Spinner';
import styles from './MessageList.module.css';

export function MessageList() {
  const messages = useAtomValue(messagesAtom);
  const loading = useAtomValue(loadingAtom);
  const error = useAtomValue(errorAtom);
  const author = useAtomValue(authorAtom);
  const fetchMessages = useSetAtom(fetchMessagesAtom);
  const clearError = useSetAtom(clearErrorAtom);


  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchMessages]);

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner size="lg" label="Loading messages…" />
      </div>
    );
  }

  return (
    <div
      className={styles.container}
    >
      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button onClick={clearError} className={styles.errorClose} aria-label="Dismiss error">
            ✕
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className={styles.empty}>
          No messages yet. Say hello!
        </div>
      ) : (
        <ol
          className={styles.list}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          aria-relevant="additions"
        >
          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.author === author}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
