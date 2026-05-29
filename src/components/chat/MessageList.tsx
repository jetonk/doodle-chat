import { useEffect, useRef, useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { messagesAtom, loadingAtom, errorAtom, authorAtom, fetchMessagesAtom, clearErrorAtom } from '../../atoms/chatAtoms';
import { POLL_INTERVAL_MS } from '../../lib/constants';
import { MessageBubble } from './MessageBubble';
import { Spinner } from '../ui/Spinner';
import styles from './MessageList.module.css';

const SCROLL_THRESHOLD_PX = 120;

export function MessageList() {
  const messages = useAtomValue(messagesAtom);
  const loading = useAtomValue(loadingAtom);
  const error = useAtomValue(errorAtom);
  const author = useAtomValue(authorAtom);
  
  const fetchMessages = useSetAtom(fetchMessagesAtom);
  const clearError = useSetAtom(clearErrorAtom);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD_PX;
  }, []);

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchMessages]);

  useEffect(() => {
    if (isNearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner size="lg" label="Loading messages…" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onScroll={handleScroll}
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

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
