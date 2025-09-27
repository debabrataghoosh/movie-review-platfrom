import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const LS_KEY = 'cinerank-wishlist-v1';

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [store, setStore] = useState({}); // { userId: { [tmdbId]: item } }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setStore(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next) => {
    setStore(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  };

  const userId = user?.id || 'guest';
  const userList = store[userId] || {};

  // Load from server when authenticated
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const resp = await fetch(`/api/wishlist?userId=${encodeURIComponent(user.id)}`);
        if (!resp.ok) throw new Error('fetch wishlist failed');
        const rows = await resp.json();
        if (cancelled) return;
        const byId = Object.fromEntries(rows.map(r => [r.id, r]));
        setStore(prev => {
          const next = { ...prev, [user.id]: byId };
          try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
      } catch {
        // ignore, fall back to local
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const isWishlisted = (id) => !!userList[id];
  const add = async (item) => {
    if (!item || !item.id) return;
    const nextLocal = { ...store, [userId]: { ...userList, [item.id]: item } };
    persist(nextLocal);
    if (user?.id) {
      try { await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, ...item }) }); } catch {}
    }
  };
  const remove = async (id) => {
    if (!userList[id]) return;
    const nextUser = { ...userList }; delete nextUser[id];
    const next = { ...store, [userId]: nextUser };
    persist(next);
    if (user?.id) {
      try { await fetch('/api/wishlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, id }) }); } catch {}
    }
  };
  const toggle = (item) => {
    if (!item || !item.id) return;
    if (userList[item.id]) remove(item.id); else add(item);
  };
  const clearAll = () => {
    const next = { ...store, [userId]: {} };
    persist(next);
  };

  const value = useMemo(() => ({
    items: Object.values(userList),
    byId: userList,
    isWishlisted,
    add,
    remove,
    toggle,
    clearAll,
    loading,
  }), [userId, store]);

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export default WishlistContext;
