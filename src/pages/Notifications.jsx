import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { notifications as notifApi } from '../services/api';
import { Bell, BellOff, AlertTriangle, CheckCheck } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────── */
const TABS = [
  { id: 'all',       label: 'All' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'updates',   label: 'Updates' },
  { id: 'system',    label: 'System' },
];

const relTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const groupLabel = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7)  return `${diff} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
};

/* ─── Skeleton ────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="mx-3 mb-2 rounded-2xl bg-white border border-border p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-surface-3 flex-shrink-0" />
      <div className="flex-1 space-y-2.5 pt-0.5">
        <div className="h-3.5 w-3/5 bg-surface-3 rounded-full" />
        <div className="h-3 w-full bg-surface-3 rounded-full" />
        <div className="h-3 w-2/3 bg-surface-3 rounded-full" />
      </div>
    </div>
  </div>
);

/* ─── Notification card ───────────────────────────────── */
const NotifCard = ({ n, onRead, onDelete }) => {
  const unread = !n.isRead;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      onClick={() => onRead(n)}
      className={`relative mx-3 mb-2 rounded-2xl border overflow-hidden cursor-pointer
                  active:scale-[0.99] transition-all duration-100
                  ${unread ? 'bg-[#F5F3FF] border-[#C4B5FD]' : 'bg-white border-border'}`}
    >
      {/* Unread left accent bar */}
      {unread && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
      )}

      <div className={`px-3 py-3.5 ${unread ? 'pl-4' : ''}`}>
        <div className="flex items-start gap-3">

          {/* Icon bubble */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[20px]
                           flex-shrink-0 mt-0.5 ${n.bg || 'bg-[#EEF2FF]'}`}>
            {n.icon || '🔔'}
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0 pr-7">
            <p className={`text-[14px] leading-snug mb-0.5
                           ${unread ? 'font-bold text-text-1' : 'font-semibold text-text-1'}`}>
              {n.title}
            </p>
            {n.sub && (
              <p className="text-[13px] text-text-2 leading-relaxed">{n.sub}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {n.cta && (
                <button
                  onClick={e => e.stopPropagation()}
                  className="text-[11px] font-bold text-primary bg-primary-light border border-[#C7D2FE]
                             rounded-lg px-2.5 py-1 hover:bg-primary hover:text-white transition-all"
                >
                  {n.cta} →
                </button>
              )}
              <span className="text-[11px] text-text-4 flex items-center gap-1 ml-auto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="w-[10px] h-[10px] flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {relTime(n.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dismiss — always visible on mobile */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(n._id); }}
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-surface-3
                   flex items-center justify-center text-text-3
                   hover:bg-red-bg hover:text-red active:scale-90 transition-all"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </motion.div>
  );
};

/* ─── Date divider ────────────────────────────────────── */
const DateDivider = ({ label }) => (
  <div className="flex items-center gap-2 px-4 py-2 mb-1">
    <div className="flex-1 h-px bg-border" />
    <span className="text-[11px] font-bold uppercase tracking-wider text-text-4 flex-shrink-0">
      {label}
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

/* ─── Main page ───────────────────────────────────────── */
export default function Notifications() {
  const navigate     = useNavigate();
  const { showToast, isLoggedIn, requireAuth, unreadNotifCount, setUnreadNotifCount } = useApp();

  const [activeTab,   setActiveTab]   = useState('all');
  const [notifs,      setNotifs]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const load = useCallback((tab = activeTab) => {
    if (!isLoggedIn) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    notifApi.list(tab)
      .then(r => {
        setNotifs(r.data.notifications || []);
        setUnreadNotifCount(r.data.unreadNotifCount ?? 0);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isLoggedIn, activeTab]);

  useEffect(() => { load(activeTab); }, [activeTab, isLoggedIn]);

  const handleMarkAll = async () => {
    try {
      await notifApi.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifCount(0);
      showToast('All marked as read ✓', 'success');
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleRead = async (n) => {
    if (!n.isRead) {
      await notifApi.markRead(n._id).catch(() => {});
      setNotifs(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
      setUnreadNotifCount(c => Math.max(0, c - 1));
    }
    if (n.ctaId)             navigate(`/event/${n.ctaId}`);
    else if (n.cta === 'Browse Events') navigate('/explore');
  };

  const handleDelete = async (id) => {
    const wasUnread = notifs.find(n => n._id === id && !n.isRead);
    setNotifs(prev => prev.filter(n => n._id !== id));
    if (wasUnread) setUnreadNotifCount(c => Math.max(0, c - 1));
    await notifApi.delete(id).catch(() => {});
  };

  /* Group by date */
  const groupedKeys = [];
  const grouped = {};
  notifs.forEach(n => {
    const lbl = groupLabel(n.createdAt);
    if (!grouped[lbl]) { grouped[lbl] = []; groupedKeys.push(lbl); }
    grouped[lbl].push(n);
  });

  /* ── Not logged in ── */
  if (!isLoggedIn) return (
    <div className="flex flex-col items-center py-24 px-6 text-center min-h-screen bg-surface-2">
      <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-5">
        <Bell size={30} strokeWidth={1.5} className="text-primary" />
      </div>
      <h2 className="font-display font-bold text-[20px] text-text-1 mb-2">Activity Center</h2>
      <p className="text-[14px] text-text-3 mb-6 max-w-[260px]">
        Sign in to receive deadline reminders, event updates, and announcements.
      </p>
      <button onClick={() => requireAuth()}
        className="px-6 py-3 bg-primary text-white rounded-xl text-[14px] font-bold
                   hover:bg-primary-dark transition-colors">
        Sign In
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="bg-surface-2 min-h-screen w-full overflow-x-hidden">

      {/* ── Header ── */}
      <div className="bg-white border-b border-border px-4 pt-5 pb-0 md:px-12 md:pt-8">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display font-bold text-[22px] md:text-[28px] text-text-1 tracking-tight leading-none">
                Activity
              </h1>
              {unreadNotifCount > 0 && (
                <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full leading-none">
                  {unreadNotifCount}
                </span>
              )}
            </div>
            <p className="text-[13px] text-text-3 mt-1">Deadlines, updates & announcements</p>
          </div>

          {unreadNotifCount > 0 && (
            <button onClick={handleMarkAll}
              className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold
                         text-primary bg-primary-light border border-[#C7D2FE] rounded-xl
                         hover:bg-primary hover:text-white transition-all flex-shrink-0 mt-0.5">
              <CheckCheck size={13} strokeWidth={2.5} />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Read all</span>
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold
                          border transition-all duration-fast
                          ${activeTab === t.id
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-text-2 border-border hover:border-primary/40 hover:text-primary'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="pt-3 pb-28 md:pb-10 md:max-w-[720px] md:mx-auto">

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 p-5 bg-white border border-border rounded-2xl text-center">
            <AlertTriangle size={32} strokeWidth={1.3} className="text-amber mx-auto mb-2" />
            <div className="font-semibold text-text-1 mb-1">Couldn't load notifications</div>
            <div className="text-[13px] text-text-3 mb-4">{error}</div>
            <button onClick={() => load()}
              className="px-4 py-2 bg-primary text-white rounded-xl text-[13px] font-semibold">
              Try again
            </button>
          </div>
        )}

        {/* Skeletons */}
        {loading && !error && (
          <div className="pt-1">
            <DateDivider label="Today" />
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && notifs.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mb-4">
              <BellOff size={28} strokeWidth={1.3} className="text-text-3" />
            </div>
            <div className="font-display font-bold text-[18px] text-text-1 mb-2">
              {activeTab === 'all' ? 'All caught up!' : `No ${activeTab} notifications`}
            </div>
            <p className="text-[14px] text-text-3 max-w-[240px]">
              {activeTab === 'all'
                ? 'Register for events to start receiving deadline reminders and updates.'
                : 'Nothing here yet — switch to All to see everything.'}
            </p>
            {activeTab !== 'all' && (
              <button onClick={() => setActiveTab('all')}
                className="mt-5 px-5 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold
                           hover:bg-primary-dark transition-colors">
                View all notifications
              </button>
            )}
          </div>
        )}

        {/* Notification groups */}
        {!loading && !error && notifs.length > 0 && (
          <AnimatePresence mode="popLayout">
            {groupedKeys.map(group => (
              <div key={group}>
                <DateDivider label={group} />
                {grouped[group].map(n => (
                  <NotifCard key={n._id} n={n} onRead={handleRead} onDelete={handleDelete} />
                ))}
              </div>
            ))}
          </AnimatePresence>
        )}

        {/* Clear all footer */}
        {!loading && !error && notifs.length > 2 && (
          <div className="text-center mt-4">
            <button
              onClick={async () => {
                await notifApi.clearAll().catch(() => {});
                setNotifs([]);
                setUnreadNotifCount(0);
                showToast('All notifications cleared', 'info');
              }}
              className="text-[13px] font-medium text-text-3 hover:text-red transition-colors">
              Clear all notifications
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
