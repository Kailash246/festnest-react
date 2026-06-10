import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { tokens, auth as authApi, events as eventsApi, notifications as notifApi } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  /* ── Saved events (client-side Set of slugs, synced to backend) ── */
  const [savedEvents,    setSavedEvents]    = useState(new Set());
  // Ref so async toggleSave always reads current state without stale closure
  const savedEventsRef = useRef(new Set());
  useEffect(() => { savedEventsRef.current = savedEvents; }, [savedEvents]);

  const [drawerOpen,          setDrawerOpen]          = useState(false);
  const [notifBannerVisible,  setNotifBannerVisible]  = useState(true);
  const [toasts,              setToasts]              = useState([]);
  const [unreadNotifCount,    setUnreadNotifCount]    = useState(0);

  /* ── Auth state — hydrated from localStorage ── */
  const [isLoggedIn,    setIsLoggedIn]    = useState(() => tokens.isLoggedIn());
  const [currentUser,   setCurrentUser]   = useState(() => tokens.getUser());
  const [authRequired,  setAuthRequired]  = useState(false);

  const isAdmin      = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isOrganizer  = currentUser?.role === 'organizer';

  /* ── Force-logout event from api.js token refresh failure ── */
  useEffect(() => {
    const handle = () => {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setSavedEvents(new Set());
    };
    window.addEventListener('festnest:logout', handle);
    return () => window.removeEventListener('festnest:logout', handle);
  }, []);

  /* ── Load saved events on mount (user already logged in from localStorage) ── */
  useEffect(() => {
    if (!tokens.isLoggedIn()) return;
    eventsApi.saved()
      .then(r => {
        const ids = new Set(
          (r.data.events || []).map(e => e.slug || e._id?.toString()).filter(Boolean)
        );
        setSavedEvents(ids);
      })
      .catch(() => {}); // non-critical — UI degrades gracefully
  }, []);

  /* ── Unread notification count — loaded once on mount ── */
  useEffect(() => {
    if (!tokens.isLoggedIn()) return;
    notifApi.list().then(r => setUnreadNotifCount(r.data.unreadCount ?? 0)).catch(() => {});
  }, []);

  /* ── Toast ── */
  const showToast = useCallback((msg, type = 'default') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }, []);

  /* ── Auth actions ── */
  const login = useCallback((user) => {
    setIsLoggedIn(true);
    const u = user || tokens.getUser();
    setCurrentUser(u);
    setAuthRequired(false);
    // Reload saved events so bookmark icons reflect actual backend state
    eventsApi.saved()
      .then(r => {
        const ids = new Set(
          (r.data.events || []).map(e => e.slug || e._id?.toString()).filter(Boolean)
        );
        setSavedEvents(ids);
      })
      .catch(() => {});
    // Refresh unread notification count for the new session
    notifApi.list().then(r => setUnreadNotifCount(r.data.unreadCount ?? 0)).catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout(); // clears tokens in localStorage
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSavedEvents(new Set());
    setUnreadNotifCount(0);
  }, []);

  const requireAuth = useCallback(() => {
    if (isLoggedIn) return true;
    setAuthRequired(true);
    return false;
  }, [isLoggedIn]);

  /* ── Refresh current user from backend (for role/profile sync) ── */
  const refreshUser = useCallback(async () => {
    try {
      const r = await authApi.me();
      const u = r.data.user || r.data;
      setCurrentUser(u);
      tokens.set(null, null, u);
    } catch { /* non-critical */ }
  }, []);

  /* ── Saved events — toggle with backend persistence ── */
  const toggleSave = useCallback(async (id) => {
    if (!isLoggedIn) { setAuthRequired(true); return; }

    // Read current state via ref to avoid stale closure
    const wasSaved = savedEventsRef.current.has(id);

    // Optimistic UI update immediately
    setSavedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else              next.add(id);
      return next;
    });
    showToast(
      wasSaved ? 'Removed from saved' : 'Saved! View in your Saved tab ✓',
      wasSaved ? 'info' : 'success'
    );

    // Persist to backend
    try {
      if (wasSaved) await eventsApi.unsave(id);
      else          await eventsApi.save(id);
    } catch {
      // Revert optimistic update on failure
      setSavedEvents(prev => {
        const next = new Set(prev);
        if (wasSaved) next.add(id);
        else          next.delete(id);
        return next;
      });
      showToast('Could not update saved status. Try again.', 'error');
    }
  }, [isLoggedIn, showToast]);

  const savedCount = savedEvents.size;

  return (
    <AppContext.Provider value={{
      /* Saved */
      savedEvents, toggleSave, savedCount,
      /* UI */
      toasts, showToast,
      drawerOpen, setDrawerOpen,
      notifBannerVisible, setNotifBannerVisible,
      /* Auth */
      isLoggedIn, login, logout, requireAuth, refreshUser,
      authRequired, setAuthRequired,
      /* User */
      currentUser, setCurrentUser, isAdmin, isSuperAdmin, isOrganizer,
      /* Notifications */
      unreadNotifCount, setUnreadNotifCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
