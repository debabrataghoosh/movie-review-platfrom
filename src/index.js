import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

// Support both CRA and Vite env var conventions
const PUBLISHABLE_KEY =
  process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  // Warn instead of throwing to avoid crashing local dev if key isn't set yet
  // Consider throwing an Error in CI or production builds
  // eslint-disable-next-line no-console
  console.warn('Clerk publishable key not found. Set REACT_APP_CLERK_PUBLISHABLE_KEY in .env');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </React.StrictMode>
);