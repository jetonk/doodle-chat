import { MessageBubble } from './MessageBubble';
import { Spinner } from '../ui/Spinner';
import styles from './MessageList.module.css';

export function MessageList() {
  const messages = [
    {
      "_id": "01a89d92-d58c-434d-956e-202cc927ad3e",
      "message": "Hey there!",
      "author": "John Doe",
      "createdAt": "2026-05-28T05:00:08.580Z"
    },
    {
      "_id": "01a89d92-d58c-434d-956e-202cc927ad3e",
      "message": "How are you?",
      "author": "Jane Doe",
      "createdAt": "2026-05-28T05:01:08.580Z"
    },
  ];
  const author = 'John Doe';
  const loading = true;
  
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
