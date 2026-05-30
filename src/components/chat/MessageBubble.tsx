import { memo } from 'react';
import { RetryIcon } from '@components/ui/Retry';
import { sendMessage } from '@atoms/chatAtoms';
import type { Message } from '../../types/message';
import styles from './MessageBubble.module.css';
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}


function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const dateStr = date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dateStr} ${timeStr}`;
}

function isUrl(str: string): boolean {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.');
}


export const MessageBubble = memo(function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const handleRetry = () => {
    sendMessage({ author: message.author, message: message.message, retryId: message._id });
  };
  
  return (
    <li className={`${styles.item} ${isOwn ? styles.own : styles.other}`}>
      <div className={`${styles.card} ${isOwn ? styles.cardOwn : styles.cardOther}`}>
        {!isOwn && (
          <span className={styles.author}>{message.author}</span>
        )}
        <p className={styles.text}>
          {isUrl(message.message) ? (
            <a
              href={message.message.startsWith('http') ? message.message : `https://${message.message}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {message.message}
            </a>
          ) : (
            message.message
          )}
        </p>
        <time
          className={`${styles.time} ${isOwn ? styles.timeOwn : ''}`}
          dateTime={message.createdAt}
          title={new Date(message.createdAt).toLocaleString()}
        >
          {formatDateTime(message.createdAt)}
        </time>
      </div>
      {message.failed && (
        <button
          className={styles.failed}
          aria-label="Failed to send — click to retry"
          onClick={handleRetry}
        >
          <RetryIcon aria-hidden />
        </button>
      )}
    </li>
  );
});
