import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { defaults } from 'chart.js';
import { applySharedConfigFromUrl } from './lib/shareLink';

// Settings carried by a shared link are restored before any tool reads them
applySharedConfigFromUrl();


// Disable animations globally for all charts for maximum fluidity
defaults.animation = false;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
);
