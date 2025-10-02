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
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorBackground: 'transparent',
          colorInputBackground: 'rgba(255,255,255,0.06)',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorTextSecondary: 'rgba(255,255,255,0.75)',
          colorDanger: '#ff6b6b',
          colorPrimary: '#e11d48',
          borderRadius: '22px'
        },
        elements: {
          userButtonPopoverCard: 'glass-ios-card overflow-hidden',
          userPreview: 'glass-ios-section',
          userButtonPopoverHeader: 'glass-ios-section',
          userButtonPopoverActions: 'glass-ios-section',
          userButtonPopoverFooter: 'glass-ios-section',

          userButtonPopoverActionButton: 'glass-ios-row glass-ios-text rounded-none',
          userButtonPopoverActionButtonIcon: 'glass-ios-text',
          userButtonPopoverActionButtonText: 'glass-ios-text',
          userButtonPopoverActionButton__danger: 'glass-ios-row glass-ios-text rounded-none',

          userPreviewMainIdentifier: 'glass-ios-text',
          userPreviewSecondaryIdentifier: 'glass-ios-muted',

          // Auth cards remain glassy
          card: 'glass-panel',
          headerTitle: 'text-white',
          headerSubtitle: 'text-white/70',
          formFieldLabel: 'text-white/80',
          formFieldInput: 'bg-white/5 backdrop-blur-sm border border-white/15 text-white',
          formButtonPrimary: 'glass-primary text-white font-semibold',
          footerActionLink: 'text-white',
          modalBackdrop: 'bg-black/60 backdrop-blur-sm'
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);