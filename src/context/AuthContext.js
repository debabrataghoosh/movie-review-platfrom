import React, { createContext, useContext, useMemo } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';

const AuthContext = createContext();

// Bridge our app's simple auth API to Clerk's SDK
export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const clerk = useClerk();

  // Map Clerk user to the shape our app roughly expects
  const mappedUser = useMemo(() => {
    if (!isSignedIn || !user) return null;
    const primaryEmail = user.primaryEmailAddress?.emailAddress || (user.emailAddresses?.[0]?.emailAddress ?? '');
    const phone = user.primaryPhoneNumber?.phoneNumber || '';
    return {
      id: user.id,
      name: user.fullName || user.firstName || user.username || 'User',
      email: primaryEmail,
      phone,
      username: user.username || '',
    };
  }, [isSignedIn, user]);

  const value = useMemo(() => ({
    user: mappedUser,
    isAuthenticated: !!mappedUser,
    // Open Clerk's sign-in modal
    openLogin: () => clerk.openSignIn?.({}) ?? clerk.redirectToSignIn(),
    // No-op close for compatibility (modal managed by Clerk)
    closeLogin: () => {},
    loginOpen: false,
    // Legacy signIn calls should just open Clerk
    signIn: () => clerk.openSignIn?.({}) ?? clerk.redirectToSignIn(),
    // Sign out via Clerk
    signOut: () => clerk.signOut({ redirectUrl: '/' }),
    isLoaded,
  }), [mappedUser, clerk, isLoaded]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
