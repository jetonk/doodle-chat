import { AuthorModal } from './components/ui/AuthorModal';
import { MessageList } from './components/chat/MessageList';
import styles from './App.module.css';

export default function App() {

  return (
    <>
      <AuthorModal />

      <div className={styles.layout}>
        <main className={styles.main}>
          <MessageList />
        </main>
      </div>
    </>
  );
}
