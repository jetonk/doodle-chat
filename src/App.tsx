import { useAtomValue } from 'jotai';
import { authorAtom } from './atoms/chatAtoms';
import { AuthorModal } from './components/ui/AuthorModal';
import { MessageList } from './components/chat/MessageList';
import { MessageInput } from './components/chat/MessageInput';
import styles from './App.module.css';

export default function App() {
  const author = useAtomValue(authorAtom);
  
  return (
    <>
      <AuthorModal />

      <div className={styles.layout}>
        <main className={styles.main}>
          <MessageList />
          {author && <MessageInput />}
        </main>
      </div>
    </>
  );
}
