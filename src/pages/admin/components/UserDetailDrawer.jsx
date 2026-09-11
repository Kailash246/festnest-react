// src/pages/admin/components/UserDetailDrawer.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Mail,
  GraduationCap,
  Award,
  Calendar,
  Bookmark,
  Ticket,
  Shield,
  Ban,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { admin } from '../../../services/api';

export default function UserDetailDrawer({
  userId,
  onClose,
  showToast,
  isSuperAdmin,
  onUserUpdated,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'registrations' | 'hosted' | 'points'
  const [adjustingPoints, setAdjustingPoints] = useState(false);
  const [pointsDelta, setPointsDelta] = useState(50);
  const [pointsReason, setPointsReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }

    setLoading(true);
    admin.getUser(userId)
      .then(res => setData(res.data))
      .catch(err => showToast?.(err.message || 'Failed to load user details', 'error'))
      .finally(() => setLoading(false));
  }, [userId, showToast]);

  if (!userId) return null;

  const user = data?.user;
  const registrations = data?.registrations || [];
  const hostedEvents = data?.hostedEvents || [];
  const pointsLog = data?.pointsLog || [];
  const savedCount = data?.savedCount ?? 0;

  const handleToggleBan = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const res = await admin.toggleBan(user._id);
      showToast(res.data?.isBanned ? 'User banned' : 'User unbanned', res.data?.isBanned ? 'error' : 'success');
      setData(prev => prev ? { ...prev, user: { ...prev.user, isBanned: res.data?.isBanned } } : null);
      onUserUpdated?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!user || user.role === newRole) return;
    setActionLoading(true);
    try {
      await admin.setRole(user._id, newRole);
      showToast(`User role updated to ${newRole}`, 'success');
      setData(prev => prev ? { ...prev, user: { ...prev.user, role: newRole } } : null);
      onUserUpdated?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    try {
      const res = await admin.adjustPoints(user._id, Number(pointsDelta), pointsReason || 'Admin adjustment');
      showToast(`Points adjusted to ${res.data?.newTotal} pts`, 'success');
      setData(prev => prev ? { ...prev, user: { ...prev.user, points: res.data?.newTotal } } : null);
      setAdjustingPoints(false);
      setPointsReason('');
      onUserUpdated?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[450] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col border-l border-border"
        >
          {/* Top header */}
          <div className="h-16 px-6 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="h-16 px-4 sm:px-6 border-b border-border flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <User size={18} className="text-primary" />
              <h3 className="font-heading font-bold text-[16px] text-text-1">User Dossier</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
              </svg>
            </div>
          ) : !user ? (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-text-3">
              User details could not be found.
            </div>
          ) : (
            <>
              {/* User Identity Header Card */}
              <div className="p-6 bg-surface-2 border-b border-border flex-shrink-0">
              <div className="p-4 sm:p-6 bg-surface-2 border-b border-border flex-shrink-0">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white font-black text-[20px] flex items-center justify-center shadow-md flex-shrink-0">
                    {user.avatar?.initials || user.name?.slice(0, 2).toUpperCase() || '??'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading font-bold text-[18px] text-text-1 truncate">
                        {user.name}
                      </h2>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${
                        user.role === 'superadmin'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : user.role === 'organizer'
                          ? 'bg-indigo-50 text-primary border-indigo-200'
                          : 'bg-surface-3 text-text-3 border-border'
                      }`}>
                        {user.role}
                      </span>
                      {user.isBanned && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                          Banned
                        </span>
                      )}
                    </div>

                    <div className="text-[13px] text-text-3 flex items-center gap-1.5 mt-1 truncate">
                      <Mail size={13} className="text-text-4 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>

                    {(user.college || user.organization) && (
                      <div className="text-[12px] text-text-2 font-medium flex items-center gap-1.5 mt-1 truncate">
                        <GraduationCap size={14} className="text-primary flex-shrink-0" />
                        <span className="truncate">{user.organization || user.college}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-bar stats */}
                <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                  <div className="p-2.5 rounded-xl bg-white border border-border">
                    <div className="text-[11px] font-bold text-text-3 uppercase tracking-wider">Points</div>
                    <div className="font-heading font-black text-[18px] text-primary tabular-nums">
                      {user.points ?? 0}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-border">
                    <div className="text-[11px] font-bold text-text-3 uppercase tracking-wider">Events Reg</div>
                    <div className="font-heading font-black text-[18px] text-text-1 tabular-nums">
                      {registrations.length}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-border">
                    <div className="text-[11px] font-bold text-text-3 uppercase tracking-wider">Saved</div>
                    <div className="font-heading font-black text-[18px] text-text-1 tabular-nums">
                      {savedCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Tabs */}
              <div className="flex border-b border-border px-6 overflow-x-auto no-scrollbar flex-shrink-0">
              <div className="flex border-b border-border px-4 sm:px-6 overflow-x-auto no-scrollbar flex-shrink-0">
                {[
                  { id: 'overview',      label: 'Actions' },
                  { id: 'registrations', label: `Registrations (${registrations.length})` },
                  { id: 'hosted',       label: `Hosted (${hostedEvents.length})` },
                  { id: 'points',       label: 'Points Log' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-3 hover:text-text-1'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Drawer Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* ── TAB 1: OVERVIEW & ADMIN CONTROLS ── */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* User Metadata */}
                    <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-2.5 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-text-3">User ID</span>
                        <span className="font-mono text-[12px] text-text-2">{user._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-3">Joined Date</span>
                        <span className="font-medium text-text-1">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-3">Email Verified</span>
                        <span className={`font-semibold ${user.isEmailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {user.isEmailVerified ? '✓ Verified' : 'Pending Verification'}
                        </span>
                      </div>
                      {user.referralCode && (
                        <div className="flex justify-between">
                          <span className="text-text-3">Referral Code</span>
                          <span className="font-mono font-bold text-text-1">{user.referralCode}</span>
                        </div>
                      )}
                    </div>

                    {/* Operational Controls */}
                    <div className="space-y-4">
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-4">
                        Account Controls
                      </h4>

                      {/* Ban / Unban Toggle */}
                      {user.role !== 'superadmin' && (
                        <div className="p-4 rounded-xl border border-border bg-white flex items-center justify-between gap-4">
                          <div>
                            <div className="font-bold text-[14px] text-text-1">
                              {user.isBanned ? 'Account is Suspended' : 'Account Status Active'}
                            </div>
                            <div className="text-[12px] text-text-3 mt-0.5">
                              {user.isBanned
                                ? 'User is prevented from registering or logging in.'
                                : 'Suspend user access to all platform features.'}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={handleToggleBan}
                            className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all disabled:opacity-50 ${
                              user.isBanned
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {user.isBanned ? 'Unban User' : 'Ban User'}
                          </button>
                        </div>
                      )}

                      {/* Super Admin Role Assignment */}
                      {isSuperAdmin && (
                        <div className="p-4 rounded-xl border border-border bg-white space-y-2">
                          <div className="font-bold text-[14px] text-text-1">Change User Role</div>
                          <p className="text-[12px] text-text-3">
                            Super admin capability to modify permission tiers.
                          </p>
                          <div className="flex gap-2 pt-1">
                            {['user', 'organizer', 'admin'].map(r => (
                              <button
                                key={r}
                                type="button"
                                disabled={actionLoading || user.role === r}
                                onClick={() => handleRoleChange(r)}
                                className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold border transition-colors ${
                                  user.role === r
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-surface-2 text-text-2 border-border hover:border-primary/40'
                                }`}
                              >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Adjust Points Form */}
                      <div className="p-4 rounded-xl border border-border bg-white space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[14px] text-text-1">Adjust Points</div>
                            <div className="text-[12px] text-text-3">Manually reward or deduct student points</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAdjustingPoints(v => !v)}
                            className="text-[13px] font-bold text-primary hover:underline"
                          >
                            {adjustingPoints ? 'Cancel' : 'Adjust'}
                          </button>
                        </div>

                        {adjustingPoints && (
                          <form onSubmit={handleAdjustPoints} className="space-y-3 pt-2 border-t border-border">
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <label className="text-[11px] font-bold text-text-3 block mb-1">Points Delta</label>
                                <input
                                  type="number"
                                  value={pointsDelta}
                                  onChange={e => setPointsDelta(e.target.value)}
                                  className="w-full text-[13px] px-3 py-2 border border-border rounded-lg bg-surface-1 focus:border-primary outline-none"
                                />
                              </div>
                              <div className="flex-[2]">
                                <label className="text-[11px] font-bold text-text-3 block mb-1">Reason</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Hackathon winner bonus"
                                  value={pointsReason}
                                  onChange={e => setPointsReason(e.target.value)}
                                  className="w-full text-[13px] px-3 py-2 border border-border rounded-lg bg-surface-1 focus:border-primary outline-none"
                                />
                              </div>
                            </div>
                            <button
                              type="submit"
                              disabled={actionLoading}
                              className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-[13px] font-bold transition-all disabled:opacity-50"
                            >
                              Confirm Adjustment
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: REGISTERED EVENTS ── */}
                {activeTab === 'registrations' && (
                  <div className="space-y-2.5">
                    {registrations.length === 0 ? (
                      <div className="py-8 text-center text-text-3 text-[13px]">
                        No event registrations recorded yet.
                      </div>
                    ) : (
                      registrations.map(reg => (
                        <div
                          key={reg._id}
                          className="p-3.5 rounded-xl border border-border bg-white flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-[13px] text-text-1 truncate">
                              {reg.event?.name || 'Event'}
                            </div>
                            <div className="text-[11px] text-text-3 mt-0.5">
                              {reg.event?.city || 'Campus'} • Status: <span className="font-semibold text-emerald-600">{reg.status || 'Confirmed'}</span>
                            </div>
                          </div>
                          {reg.event?.slug && (
                            <a
                              href={`/event/${reg.event.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-primary-light hover:text-primary flex items-center justify-center text-text-3 transition-colors flex-shrink-0"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── TAB 3: HOSTED EVENTS ── */}
                {activeTab === 'hosted' && (
                  <div className="space-y-2.5">
                    {hostedEvents.length === 0 ? (
                      <div className="py-8 text-center text-text-3 text-[13px]">
                        No events submitted or hosted by this user.
                      </div>
                    ) : (
                      hostedEvents.map(h => (
                        <div
                          key={h._id}
                          className="p-3.5 rounded-xl border border-border bg-white flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-[13px] text-text-1 truncate">
                              {h.eventName}
                            </div>
                            <div className="text-[11px] text-text-3 mt-0.5">
                              {h.eventType} • {h.college}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            h.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : h.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {h.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── TAB 4: POINTS LOG FEED ── */}
                {activeTab === 'points' && (
                  <div className="space-y-2.5">
                    {pointsLog.length === 0 ? (
                      <div className="py-8 text-center text-text-3 text-[13px]">
                        No points transactions logged yet.
                      </div>
                    ) : (
                      pointsLog.map(log => (
                        <div
                          key={log._id}
                          className="p-3 rounded-xl border border-border bg-white flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-[13px] text-text-1 capitalize">
                              {log.action}
                            </div>
                            <div className="text-[11px] text-text-3 truncate mt-0.5">
                              {log.description || 'Points updated'}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`font-mono font-bold text-[13px] ${
                              log.points >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {log.points >= 0 ? `+${log.points}` : log.points}
                            </span>
                            <div className="text-[10px] text-text-4">
                              {log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

