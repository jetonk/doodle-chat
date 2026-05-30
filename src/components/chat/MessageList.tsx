import { useEffect, useLayoutEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { authorAtom } from '../../atoms/authAtoms';
import { useChatState, fetchMessages, clearError, loadEarlier } from '../../atoms/chatAtoms';
import { POLL_INTERVAL_MS } from '../../lib/constants';
import { MessageBubble } from './MessageBubble';
import styles from './MessageList.module.css';

const SCROLL_THRESHOLD_PX = 120;

export function MessageList() {
  const { messages, loading, error, hasMore, loadingEarlier } = useChatState();
  const author = useAtomValue(authorAtom);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);
  const prevScrollHeightRef = useRef<number | null>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD_PX;
  };

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);


  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el && prevScrollHeightRef.current !== null) {
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null;
      return;
    }
    if (isNearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleLoadEarlier = () => {
    if (loadingEarlier) return;
    prevScrollHeightRef.current = containerRef.current?.scrollHeight ?? null;
    loadEarlier();
  };

  if (loading) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} role="status" aria-label="Loading messages..." />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onScroll={handleScroll}
      tabIndex={0}
      aria-label="Message history"
    >
      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button onClick={() => clearError()} className={styles.errorClose} aria-label="Dismiss error">
            ✕
          </button>
        </div>
      )}

      {hasMore && messages.length > 0 && (
        <div className={styles.loadEarlier}>
          <button
            className={styles.loadEarlierButton}
            onClick={handleLoadEarlier}
            disabled={loadingEarlier}
            aria-busy={loadingEarlier}
            aria-label="Load earlier messages"
          >
            {loadingEarlier ? 'Loading…' : 'Load earlier messages'}
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <p role="status" className={styles.empty}>
          No messages yet. Say hello!
        </p>
      ) : (
        <div role="log" aria-label="Chat messages" aria-relevant="additions" aria-live="polite">
          <ol className={styles.list}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.author === author}
              />
            ))}
          </ol>
        </div>
      )}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
