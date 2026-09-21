import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Guard against third-party extension connection errors (e.g., MetaMask, Solana, Web3 extensions)
if (typeof window !== 'undefined') {
  // Suppress extension errors in console to prevent false positives in dev/preview overlays
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const errorText = args.map((a) => (typeof a === 'string' ? a : a?.message || JSON.stringify(a) || '')).join(' ');
    if (
      errorText.includes('MetaMask') ||
      errorText.includes('Failed to connect to MetaMask') ||
      errorText.includes('chrome-extension://') ||
      errorText.includes('moz-extension://') ||
      errorText.includes('ethereum')
    ) {
      return; // Silently swallow third-party wallet injection failures
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || reason?.stack || '';
      if (
        msg.includes('MetaMask') ||
        msg.includes('Failed to connect to MetaMask') ||
        msg.includes('extension context invalidated') ||
        msg.includes('chrome-extension')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'error',
    (event) => {
      const msg = event.message || '';
      const filename = event.filename || '';
      if (
        msg.includes('MetaMask') ||
        msg.includes('Failed to connect to MetaMask') ||
        filename.includes('chrome-extension') ||
        filename.includes('moz-extension')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

