import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext();

const LS_KEY = 'cinerank-auth-user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const signIn = async (arg1, email) => {
    // Support both legacy (name, email) and full profile object
    let profile;
    if (typeof arg1 === 'object' && arg1) {
      profile = { ...arg1 };
    } else {
      profile = { name: String(arg1 || '').trim(), email: String(email || '').trim() };
    }
    // Compute stable id preference: email -> phone -> username -> guest
    const id = profile.id || profile.email || (profile.phone ? `tel:${profile.phone}` : '') || profile.username || `guest_${Date.now()}`;
    const provisional = {
      id,
      name: profile.name || 'Guest',
      email: profile.email || '',
      phone: profile.phone || '',
      username: profile.username || '',
      age_category: profile.age_category || '',
      genres: Array.isArray(profile.genres) ? profile.genres : [],
    };
    try {
      const resp = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(provisional) });
      if (resp.ok) {
        const saved = await resp.json();
        setUser(saved);
        try { localStorage.setItem(LS_KEY, JSON.stringify(saved)); } catch {}
        setLoginOpen(false);
        return saved;
      }
    } catch {}
    setUser(provisional);
    try { localStorage.setItem(LS_KEY, JSON.stringify(provisional)); } catch {}
    setLoginOpen(false);
    return provisional;
  };

  const signOut = () => {
    setUser(null);
    try { localStorage.removeItem(LS_KEY); } catch {}
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    openLogin: () => setLoginOpen(true),
    closeLogin: () => setLoginOpen(false),
    loginOpen,
    signIn,
    signOut,
  }), [user, loginOpen]);

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
