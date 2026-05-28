import { memo } from 'react';
import type { Message } from '../../types/message';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const dateStr = date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
}

export const MessageBubble = memo(function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <li className={`${styles.item} ${isOwn ? styles.own : styles.other}`}>
      <div className={`${styles.card} ${isOwn ? styles.cardOwn : styles.cardOther}`}>
        {!isOwn && (
          <span className={styles.author}>{message.author}</span>
        )}
        <p className={styles.text}>{message.message}</p>
        <time
          className={`${styles.time} ${isOwn ? styles.timeOwn : ''}`}
          dateTime={message.createdAt}
          title={new Date(message.createdAt).toLocaleString()}
        >
          {formatDateTime(message.createdAt)}
        </time>
      </div>
    </li>
  );
});
