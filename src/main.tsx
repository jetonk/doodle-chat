import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'jotai';
import { store } from './atoms/store';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
