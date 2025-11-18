import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { AppProviders, getProvidersContext } from './lib/providers.tsx';

import '@sonr.io/ui/styles/globals.css';
import reportWebVitals from './reportWebVitals';

// Register Service Worker for Payment Handler API and Vault
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      console.log('[Motor Vault] ServiceWorker registered:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 3600000); // 1 hour

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[Motor Vault] New ServiceWorker available');
          }
        });
      });
    } catch (error) {
      console.error('[Motor Vault] ServiceWorker registration failed:', error);
    }
  });
}

// Create providers context
const providersContext = getProvidersContext();

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AppProviders {...providersContext}>
        <></>
      </AppProviders>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
