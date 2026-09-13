// src/pages/admin/tabs/ActivityTab.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Activity,
  Eye,
  Compass,
  CheckCircle2,
  Ticket,
  Bookmark,
  Heart,
  CalendarPlus,
  Sparkles,
  Gift,
  Coins,
  CircleDollarSign,
  UserCheck,
  Edit,
  LogIn,
  LogOut,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Calendar,
  Shield,
  ExternalLink,
  ChevronDown,
  Copy,
  Check,
  Laptop,
} from 'lucide-react';
import { admin } from '../../../services/api';

/* ─── Helpers ────────────────────────────────────────────── */
function formatDuration(seconds = 0) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  if (s < 60) return `${s}s`;
  const mins = Math.floor(s / 60);
  const remSecs = s % 60;
  if (mins < 60) return remSecs > 0 ? `${mins}m ${remSecs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
}

function formatRelativeTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffSecs = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffSecs < 45) return 'Just now';
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  if (diffSecs < 86400 * 7) return `${Math.floor(diffSecs / 86400)}d ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const ROLE_CONFIG = {
  user: { label: 'Student', color: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  organizer: { label: 'Organizer', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  admin: { label: 'Admin', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  superadmin: { label: 'Super Admin', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

function getTimelineItemConfig(item) {
  const type = (item?.type || '').toLowerCase();
  const action = (item?.action || '').toLowerCase();

  if (type === 'page_view' || action === 'page_view') {
    return {
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200',
      label: 'Page View',
      title: item?.page?.path ? `Viewed "${item.page.path}"` : 'Page View',
    };
  }
  if (type === 'event_registration' || type === 'registration' || action.includes('register')) {
    return {
      icon: Ticket,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-200',
      label: 'Registration',
      title: item?.page?.title ? `Registered for "${item.page.title}"` : 'Event Registration',
    };
  }
  if (type === 'wishlist' || type === 'save' || action.includes('save')) {
    return {
      icon: Bookmark,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-200',
      label: action === 'unsave_event' ? 'Removed from Wishlist' : 'Saved to Wishlist',
      title: item?.page?.title ? `Wishlist: "${item.page.title}"` : 'Event Wishlist',
    };
  }
  if (type === 'event_creation' || action.includes('create') || action.includes('host')) {
    return {
      icon: CalendarPlus,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
      label: 'Event Submission',
      title: item?.metadata?.eventName ? `Submitted "${item.metadata.eventName}"` : 'Event Created / Submitted',
    };
  }
  if (type === 'referral_use' || type === 'referral' || action.includes('refer')) {
    return {
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      label: 'Referral',
      title: item?.metadata?.referralCode ? `Referral code used: ${item.metadata.referralCode}` : 'Referral Reward Action',
    };
  }
  if (type === 'coin_transaction' || type === 'coin' || action.includes('coin') || action.includes('spin')) {
    return {
      icon: Coins,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
      label: 'FN Coins',
      title: item?.metadata?.rewardLabel || item?.metadata?.reason || 'Coin Transaction / Wheel Spin',
    };
  }
  if (type === 'profile_update' || type === 'profile' || action.includes('profile') || action.includes('avatar')) {
    return {
      icon: UserCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      label: 'Profile',
      title: 'Profile Updated',
    };
  }
  if (type === 'session_start' || action === 'session_start') {
    return {
      icon: LogIn,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 border-teal-200',
      label: 'Session Start',
      title: 'User Started New Session',
    };
  }
  if (type === 'session_end' || action === 'session_end') {
    return {
      icon: LogOut,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100 border-slate-200',
      label: 'Session End',
      title: 'Session Ended',
    };
  }

  return {
    icon: Activity,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    label: action || type || 'Activity',
    title: item?.metadata?.description || action || 'User Interaction',
  };
}

/* ────────────────────────────────────────────────────────
   Main ActivityTab Component
──────────────────────────────────────────────────────── */
export default function ActivityTab({ showToast, selectedUserId: propUserId, onSelectUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if URL has /admin/activity/:userId
  const routeUserId = useMemo(() => {
    const match = location.pathname.match(/\/admin\/activity\/([^/?#]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const activeUserId = propUserId || routeUserId;

  /* ─── List View State ──────────────────────────────────── */
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [refreshingList, setRefreshingList] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'online' | 'offline'
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastActiveAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ totalUsers: 0, onlineCount: 0, offlineCount: 0 });

  /* ─── Detail View State ────────────────────────────────── */
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  /* ─── Fetch Users List ─────────────────────────────────── */
  const loadUserActivities = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoadingUsers(true);
    try {
      const params = {
        page,
        limit,
        status: statusFilter,
        role: roleFilter,
        sortBy,
        sortOrder,
      };
      if (search.trim()) params.search = search.trim();

      const res = await admin.activity.getUsers(params);
      const d = res.data || {};
      setUsers(d.users || []);
      if (d.pagination) setPagination(d.pagination);
      if (d.stats) setStats(d.stats);
    } catch (err) {
      showToast?.(err?.message || 'Failed to fetch user activity list', 'error');
    } finally {
      setLoadingUsers(false);
      setRefreshingList(false);
    }
  }, [page, limit, statusFilter, roleFilter, sortBy, sortOrder, search, showToast]);

  // Debounced search / filter trigger
  useEffect(() => {
    if (activeUserId) return; // don't fetch list if viewing detail
    const t = setTimeout(() => {
      loadUserActivities();
    }, 200);
    return () => clearTimeout(t);
  }, [loadUserActivities, activeUserId]);

  /* ─── Fetch User Detail ────────────────────────────────── */
  const loadUserDetail = useCallback(async () => {
    if (!activeUserId) return;
    setLoadingDetail(true);
    try {
      const res = await admin.activity.getUserDetail(activeUserId);
      setDetailData(res.data || null);
    } catch (err) {
      showToast?.(err?.message || 'Failed to load user activity details', 'error');
    } finally {
      setLoadingDetail(false);
    }
  }, [activeUserId, showToast]);

  useEffect(() => {
    if (activeUserId) {
      loadUserDetail();
    } else {
      setDetailData(null);
    }
  }, [activeUserId, loadUserDetail]);

  /* ─── Navigation Handlers ──────────────────────────────── */
  const handleSelectUserRow = (userId) => {
    if (onSelectUser) onSelectUser(userId);
    navigate(`/admin/activity/${userId}`);
  };

  const handleBackToList = () => {
    if (onSelectUser) onSelectUser(null);
    navigate('/admin/activity');
  };

  const handleCopySession = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
    showToast?.('Session ID copied to clipboard', 'info');
  };

  /* ────────────────────────────────────────────────────────
     RENDER: DETAIL VIEW
  ──────────────────────────────────────────────────────── */
  if (activeUserId) {
    const u = detailData?.user;
    const isOnline = detailData?.isOnline;
    const userStats = detailData?.stats || {};
    const curSession = detailData?.currentSession;
    const pages = detailData?.pagesVisited || [];
    const timeline = detailData?.timeline || [];
    const roleConf = ROLE_CONFIG[u?.role] || ROLE_CONFIG.user;

    return (
      <div className="space-y-6">
        {/* Back navigation & Refresh */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-neutral-700 hover:text-indigo-600 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Activity Directory</span>
          </button>

          <button
            type="button"
            onClick={loadUserDetail}
            disabled={loadingDetail}
            className="p-2 text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 shadow-sm transition disabled:opacity-50"
            title="Refresh user data"
          >
            <RotateCw className={`w-4 h-4 ${loadingDetail ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>

        {loadingDetail && !detailData ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
            <div className="w-9 h-9 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-neutral-500">Loading user telemetry profile...</p>
          </div>
        ) : !u ? (

          <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 shadow-sm">
            <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800">User not found</h3>
            <p className="text-xs text-neutral-500 mt-1">The requested user activity profile could not be loaded.</p>
            <button
              onClick={handleBackToList}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Return to User List
            </button>
          </div>
        ) : (
          <>
            {/* Header Profile & Key Metrics Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left: User Avatar & Info */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-heading font-black text-xl shadow-md border-2 border-white">
                      {u.avatar?.initials || u.name?.slice(0, 2).toUpperCase() || 'FN'}
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                      title={isOnline ? 'Online now' : 'Offline'}
                    >
                      {isOnline && <span className="animate-ping w-2 h-2 rounded-full bg-white opacity-75" />}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-heading font-black text-lg sm:text-xl text-neutral-900 truncate">
                        {u.name}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${roleConf.color}`}>
                        {roleConf.label}
                      </span>
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online Now
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Offline
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 font-mono truncate">{u.email}</p>
                    {u.college && (
                      <p className="text-xs text-neutral-600 font-medium truncate mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        {u.college} {u.city ? `(${u.city})` : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Today Active</span>
                    <span className="font-heading font-black text-sm sm:text-base text-indigo-600 tabular-nums">
                      {userStats.activeTimeTodayFormatted || formatDuration(userStats.activeTimeToday)}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">All-Time Active</span>
                    <span className="font-heading font-black text-sm sm:text-base text-neutral-900 tabular-nums">
                      {userStats.totalActiveTimeFormatted || formatDuration(userStats.totalActiveTime)}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total Sessions</span>
                    <span className="font-heading font-black text-sm sm:text-base text-neutral-900 tabular-nums">
                      {userStats.totalSessions ?? 0}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Events Logged</span>
                    <span className="font-heading font-black text-sm sm:text-base text-neutral-900 tabular-nums">
                      {userStats.totalActivities ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current or Latest Session Card */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      {isOnline ? 'Current Live Session' : 'Latest Session Telemetry'}
                    </h3>
                    <p className="text-[11px] text-neutral-400">Device, IP, and navigation context</p>
                  </div>
                </div>

                {curSession?.sessionId && (
                  <button
                    type="button"
                    onClick={() => handleCopySession(curSession.sessionId)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium text-neutral-600 hover:text-indigo-600 bg-neutral-50 hover:bg-indigo-50 border border-neutral-200 rounded-lg transition"
                    title="Copy Session ID"
                  >
                    {copiedSessionId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{curSession.sessionId.slice(0, 8)}...</span>
                  </button>
                )}
              </div>

              {curSession ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1">Session Started</span>
                    <span className="font-bold text-neutral-800 block truncate">{formatDateTime(curSession.startedAt)}</span>
                    <span className="text-[10px] text-neutral-400">{formatRelativeTime(curSession.startedAt)}</span>
                  </div>

                  <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1">Duration</span>
                    <span className="font-bold text-indigo-600 block text-sm tabular-nums">
                      {formatDuration(curSession.duration)}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {curSession.isActive ? 'Pinging live' : 'Session closed'}
                    </span>
                  </div>

                  <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1">Current / Exit Path</span>
                    <span className="font-mono font-semibold text-neutral-800 block truncate" title={curSession.currentPage}>
                      {curSession.currentPage || '/'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {curSession.pageViewsCount ?? 1} page views
                    </span>
                  </div>

                  <div className="bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1">Device & Client</span>
                    <span className="font-semibold text-neutral-800 block truncate flex items-center gap-1.5">
                      {curSession.device?.type === 'mobile' ? (
                        <Smartphone className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      ) : curSession.device?.type === 'tablet' ? (
                        <Tablet className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      )}
                      <span>{curSession.device?.browser || 'Browser'} on {curSession.device?.os || 'OS'}</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 block truncate font-mono">
                      IP: {curSession.ip || 'Anonymous'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic py-2">No active or recorded session found for this user.</p>
              )}
            </div>

            {/* Pages Visited Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Pages Visited & Time Allocation</h3>
                  <p className="text-[11px] text-neutral-400">Routes explored and aggregated engagement duration</p>
                </div>
                <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg">
                  {pages.length} Unique Pages
                </span>
              </div>

              {pages.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs">No page view records recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50/70 border-b border-neutral-100 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        <th className="py-2.5 px-4">Path</th>
                        <th className="py-2.5 px-4">Page Title</th>
                        <th className="py-2.5 px-4 text-center">Visits</th>
                        <th className="py-2.5 px-4 text-center">Time Spent</th>
                        <th className="py-2.5 px-4 text-right">Last Visited</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {pages.map((p, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50/60 transition">
                          <td className="py-2.5 px-4 font-mono font-semibold text-neutral-800">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200/80 text-[11px]">
                              {p.path}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-neutral-600 truncate max-w-xs">{p.title || '—'}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-neutral-800 tabular-nums">
                            {p.visitCount || p.count || 1}
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-indigo-600 tabular-nums">
                            {p.formattedDuration || formatDuration(p.totalDuration)}
                          </td>
                          <td className="py-2.5 px-4 text-right text-neutral-400 text-[11px] whitespace-nowrap">
                            {formatRelativeTime(p.lastVisitedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Chronological Activity Timeline */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Activity & Interaction Timeline</h3>
                  <p className="text-[11px] text-neutral-400">Full audit trail of user navigations, actions, and events</p>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                  {timeline.length} Events
                </span>
              </div>

              {timeline.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs">No recorded events for this user yet.</div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {timeline.map((item, idx) => {
                    const cfg = getTimelineItemConfig(item);
                    const Icon = cfg.icon;

                    return (
                      <div key={item._id || idx} className="relative group">
                        {/* Timeline Icon Node */}
                        <div
                          className={`absolute -left-6 top-1 w-6 h-6 rounded-full border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${cfg.bgColor}`}
                        >
                          <Icon className={`w-3 h-3 ${cfg.color}`} />
                        </div>

                        {/* Content Box */}
                        <div className="bg-neutral-50/80 hover:bg-neutral-50 border border-neutral-200/70 hover:border-neutral-300 rounded-xl p-3 transition-colors text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900 text-[12px]">{cfg.title}</span>
                              <span className="px-1.5 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] font-semibold text-neutral-600">
                                {cfg.label}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-medium" title={formatDateTime(item.createdAt)}>
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>

                          {/* Route / Page detail */}
                          {item.page?.path && (
                            <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                              Route: <span className="text-neutral-700 font-semibold">{item.page.path}</span>
                              {item.durationOnPage > 0 && (
                                <span className="ml-2 text-indigo-600 font-sans font-medium">
                                  ({formatDuration(item.durationOnPage)} on page)
                                </span>
                              )}
                            </div>
                          )}

                          {/* Metadata preview tags */}
                          {item.metadata && Object.keys(item.metadata).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-neutral-200/60">
                              {Object.entries(item.metadata).map(([k, v]) => {
                                if (v === undefined || v === null || typeof v === 'object') return null;
                                return (
                                  <span
                                    key={k}
                                    className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-[10px] text-neutral-600 font-mono"
                                  >
                                    <strong className="font-semibold text-neutral-800">{k}:</strong> {String(v)}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────
     RENDER: LIST VIEW
  ──────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Top Header & Live Counter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-black text-lg text-neutral-900 tracking-tight flex items-center gap-2.5">
            <span>User Activity Directory</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time user sessions, online presence, active duration, and engagement telemetry.
          </p>
        </div>

        {/* Live Status Badges & Refresh */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{stats.onlineCount} Online Now</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xl text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-neutral-500" />
            <span>{stats.totalUsers} Total Tracked</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setRefreshingList(true);
              loadUserActivities(true);
            }}
            disabled={refreshingList || loadingUsers}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition disabled:opacity-50"
            title="Refresh user list"
          >
            <RotateCw className={`w-4 h-4 ${refreshingList ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status & Role Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {/* Status buttons */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl text-xs font-semibold">
            {[
              { label: 'All', value: 'all' },
              { label: 'Online', value: 'online' },
              { label: 'Offline', value: 'offline' },
            ].map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => { setStatusFilter(s.value); setPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === s.value
                    ? 'bg-white text-neutral-900 shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Role selector */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl text-xs font-semibold">
            {[
              { label: 'All Roles', value: 'all' },
              { label: 'Students', value: 'user' },
              { label: 'Organizers', value: 'organizer' },
              { label: 'Admins', value: 'admin' },
            ].map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => { setRoleFilter(r.value); setPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  roleFilter === r.value
                    ? 'bg-white text-neutral-900 shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            aria-label="Search users by name, email, or college"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, or college..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>
      </div>

      {/* Users Activity Table */}
      {loadingUsers ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium text-neutral-500">Querying live session telemetry...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/80 shadow-sm">
          <Activity className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800">No active users match criteria</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting search terms or toggling the Online/Offline status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/60 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th
                    role="button"
                    tabIndex={0}
                    aria-sort={sortBy === 'lastActiveAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className="py-3 px-4 cursor-pointer hover:text-neutral-900 select-none outline-none focus-visible:underline"
                    onClick={() => {
                      if (sortBy === 'lastActiveAt') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('lastActiveAt'); setSortOrder('desc'); }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (sortBy === 'lastActiveAt') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                        else { setSortBy('lastActiveAt'); setSortOrder('desc'); }
                      }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      Last Active {sortBy === 'lastActiveAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </span>
                  </th>
                  <th
                    role="button"
                    tabIndex={0}
                    aria-sort={sortBy === 'lastLoginAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className="py-3 px-4 cursor-pointer hover:text-neutral-900 select-none outline-none focus-visible:underline"
                    onClick={() => {
                      if (sortBy === 'lastLoginAt') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('lastLoginAt'); setSortOrder('desc'); }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (sortBy === 'lastLoginAt') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                        else { setSortBy('lastLoginAt'); setSortOrder('desc'); }
                      }
                    }}
                  >
                    <span className="flex items-center gap-1">
                      Last Login {sortBy === 'lastLoginAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </span>
                  </th>
                  <th className="py-3 px-4 text-center">Active Today</th>
                  <th className="py-3 px-4">Current Page</th>
                  <th className="py-3 px-4 text-center">Sessions</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {users.map(u => {
                  const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
                  const isOnline = Boolean(u.isOnline);

                  return (
                    <tr
                      key={u._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectUserRow(u._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectUserRow(u._id);
                        }
                      }}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer group outline-none focus-visible:bg-indigo-50/50"
                    >
                      {/* User Column */}

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              {u.avatar?.initials || u.name?.slice(0, 2).toUpperCase() || 'FN'}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-neutral-900 group-hover:text-indigo-600 transition block truncate">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 font-mono block truncate">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleConf.color}`}>
                          {roleConf.label}
                        </span>
                      </td>

                      {/* Online / Offline Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Offline
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-600" title={formatDateTime(u.lastActiveAt)}>
                        <span className="font-medium">{formatRelativeTime(u.lastActiveAt)}</span>
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-500" title={formatDateTime(u.lastLoginAt)}>
                        <span>{formatRelativeTime(u.lastLoginAt)}</span>
                      </td>

                      {/* Active Time Today */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-indigo-600 tabular-nums">
                          {u.activeTimeTodayFormatted || formatDuration(u.activeTimeToday)}
                        </span>
                      </td>

                      {/* Current Page */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {u.currentPage ? (
                          <span className="px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200/80 font-mono text-[11px] text-neutral-700 max-w-[160px] truncate inline-block">
                            {u.currentPage}
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">—</span>
                        )}
                      </td>

                      {/* Sessions Today */}
                      <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-neutral-700 tabular-nums">
                        {u.sessionsToday || 0}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:text-indigo-700">
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-neutral-200/80 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-neutral-500">
                Showing <strong className="text-neutral-800 font-semibold">{(page - 1) * limit + 1}</strong> to{' '}
                <strong className="text-neutral-800 font-semibold">
                  {Math.min(page * limit, pagination.total)}
                </strong>{' '}
                of <strong className="text-neutral-800 font-semibold">{pagination.total}</strong> users
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 font-bold text-neutral-800 bg-white border border-neutral-200 rounded-lg">
                  {page} / {pagination.totalPages}
                </span>

                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

