import { createRoot } from 'react-dom/client';
import { CookiesProvider } from 'react-cookie';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <CookiesProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </CookiesProvider>
);
