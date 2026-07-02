// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { admin, events as eventsApi } from '../../services/api';
import { normaliseEvents } from '../../services/normalise';
import {
  BarChart3, ClipboardList, CalendarDays, Users, Ticket, Star, Megaphone,
  AlertTriangle, Hourglass, CheckCircle2, MapPin, Calendar, Eye, Trash2,
  Trophy, Lock, Medal, Lightbulb, Send,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   SHARED TINY COMPONENTS
═══════════════════════════════════════════════════════ */
const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/>
    </svg>
  </div>
);

const Badge = ({ children, color = 'indigo' }) => {
  const styles = {
    indigo: 'bg-primary-light text-primary border-[#C7D2FE]',
    green:  'bg-green-bg text-[#16A34A] border-green-border',
    amber:  'bg-amber-bg text-amber border-amber-border',
    red:    'bg-red-bg text-red border-red-border',
    gray:   'bg-surface-3 text-text-3 border-border',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${styles[color]}`}>
      {children}
    </span>
  );
};

const StatCard = ({ icon, label, value, sub, color = 'indigo' }) => {
  const bg = { indigo: 'bg-primary-light text-primary', green: 'bg-green-bg text-[#16A34A]', amber: 'bg-amber-bg text-amber', red: 'bg-red-bg text-red' };
  return (
    <div className="bg-white border border-border rounded-lg p-4 shadow-1 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-md flex items-center justify-center text-xl flex-shrink-0 ${bg[color]}`}>{icon}</div>
      <div>
        <div className="text-[22px] font-display font-bold text-text-1 leading-none">{value ?? '—'}</div>
        <div className="text-[12px] text-text-2 font-medium mt-0.5">{label}</div>
        {sub && <div className="text-[11px] text-text-3 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
};

const SectionHeader = ({ title, sub }) => (
  <div className="mb-4">
    <h3 className="font-display font-bold text-[16px] text-text-1 tracking-tight">{title}</h3>
    {sub && <p className="text-[13px] text-text-3 mt-0.5">{sub}</p>}
  </div>
);

const EmptyState = ({ icon, title, sub }) => (
  <div className="text-center py-12">
    <div className="mb-3 flex justify-center text-text-4">{icon}</div>
    <div className="font-semibold text-text-2 text-[14px]">{title}</div>
    {sub && <div className="text-[13px] text-text-3 mt-1">{sub}</div>}
  </div>
);

const Btn = ({ onClick, children, variant = 'primary', size = 'sm', disabled, loading }) => {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-md transition-all duration-150 disabled:opacity-50";
  const sizes = { sm: 'px-3 py-1.5 text-[12px]', md: 'px-4 py-2 text-[13px]', lg: 'px-5 py-2.5 text-[14px]' };
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    ghost:   'bg-surface-2 text-text-2 hover:bg-surface-3 border border-border',
    danger:  'bg-red-bg text-red border border-red-border hover:bg-[#FEE2E2]',
    success: 'bg-green-bg text-[#16A34A] border border-green-border hover:bg-[#DCFCE7]',
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {loading ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round"/></svg> : children}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════
   NAV TABS
═══════════════════════════════════════════════════════ */
const TABS = [
  { id: 'overview',    label: 'Overview',    Icon: BarChart3 },
  { id: 'submissions', label: 'Submissions', Icon: ClipboardList },
  { id: 'events',      label: 'Events',      Icon: CalendarDays },
  { id: 'users',       label: 'Users',       Icon: Users },
  { id: 'tickets',     label: 'Tickets',     Icon: Ticket },
  { id: 'featured',    label: 'Featured',    Icon: Star, superAdminOnly: true },
  { id: 'notify',      label: 'Broadcast',   Icon: Megaphone },
];

/* ═══════════════════════════════════════════════════════
   OVERVIEW TAB
═══════════════════════════════════════════════════════ */
function OverviewTab({ showToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.stats()
      .then(r => setStats(r.data))
      .catch(e => showToast?.(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) return <Spinner />;
  if (!stats) return <EmptyState icon={<AlertTriangle size={40} strokeWidth={1.5} />} title="Could not load stats" />;

  const { totals, categoryBreakdown = [], registrationsTrend = [], recentUsers = [], recentSubmissions = [] } = stats;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={<Users size={19} strokeWidth={2} />}        label="Total Users"     value={totals?.totalUsers}          color="indigo" />
        <StatCard icon={<CalendarDays size={19} strokeWidth={2} />} label="Live Events"     value={totals?.totalEvents}          color="green" />
        <StatCard icon={<Hourglass size={19} strokeWidth={2} />}    label="Pending Reviews" value={totals?.pendingSubmissions}   color="amber" />
        <StatCard icon={<CheckCircle2 size={19} strokeWidth={2} />} label="Registrations"   value={totals?.totalRegistrations}   color="indigo" />
        <StatCard icon={<Ticket size={19} strokeWidth={2} />}       label="Open Tickets"    value={totals?.openTickets}          color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-1">
          <SectionHeader title="Events by Category" />
          <div className="space-y-2">
            {categoryBreakdown.map(({ _id, count }) => {
              const max = Math.max(...categoryBreakdown.map(c => c.count), 1);
              const pct = Math.round((count / max) * 100);
              return (
                <div key={_id} className="flex items-center gap-3">
                  <div className="text-[13px] text-text-2 w-32 flex-shrink-0 truncate">{_id}</div>
                  <div className="flex-1 bg-surface-3 rounded-full h-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-2 bg-primary rounded-full" />
                  </div>
                  <div className="text-[12px] font-bold text-text-3 w-6 text-right">{count}</div>
                </div>
              );
            })}
            {categoryBreakdown.length === 0 && <div className="text-[13px] text-text-3">No data yet</div>}
          </div>
        </div>

        {/* Registrations trend */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-1">
          <SectionHeader title="Registrations (Last 7 Days)" />
          <div className="flex items-end gap-2 h-28">
            {registrationsTrend.length === 0
              ? <div className="text-[13px] text-text-3 self-center w-full text-center">No data yet</div>
              : registrationsTrend.map(({ _id, count }) => {
                const max = Math.max(...registrationsTrend.map(r => r.count), 1);
                const h = Math.max(8, Math.round((count / max) * 100));
                return (
                  <div key={_id} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] font-bold text-text-3">{count}</div>
                    <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.5 }}
                      className="w-full bg-primary rounded-t min-h-[8px]" style={{ height: `${h}%` }} />
                    <div className="text-[9px] text-text-4 truncate w-full text-center">{_id.slice(5)}</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-1">
          <SectionHeader title="Recent Signups" />
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-[11px] font-bold text-primary flex-shrink-0">
                  {u.name?.slice(0,2).toUpperCase() || '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-text-1 truncate">{u.name}</div>
                  <div className="text-[11px] text-text-3 truncate">{u.email}</div>
                </div>
                <div className="text-[10px] text-text-4 flex-shrink-0">{u.college || '—'}</div>
              </div>
            ))}
            {recentUsers.length === 0 && <div className="text-[13px] text-text-3">No users yet</div>}
          </div>
        </div>

        {/* Recent pending submissions */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-1">
          <SectionHeader title="Pending Submissions" sub="Awaiting review" />
          <div className="space-y-3">
            {recentSubmissions.map(s => (
              <div key={s._id} className="flex items-start gap-3 p-3 bg-amber-bg border border-amber-border rounded-md">
                <div className="flex-shrink-0 text-amber mt-0.5"><ClipboardList size={18} strokeWidth={2} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-text-1 truncate">{s.eventName}</div>
                  <div className="text-[11px] text-text-3">{s.submittedBy?.name} · {s.college}</div>
                </div>
                <Badge color="amber">Pending</Badge>
              </div>
            ))}
            {recentSubmissions.length === 0 && <div className="text-[13px] text-text-3">No pending submissions</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SUBMISSION PREVIEW MODAL
═══════════════════════════════════════════════════════ */
function SubmissionPreviewModal({ sub, onClose }) {
  const entryLabel = sub?.isPaid ? `₹${sub.entryFee} Entry` : sub?.hasPrize ? 'Prize Pool' : 'Free Entry';
  const entryStyle = sub?.isPaid
    ? { color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A' }
    : sub?.hasPrize
    ? { color: '#4F46E5', background: '#EEF2FF', border: '1px solid #C7D2FE' }
    : { color: '#16A34A', background: '#F0FDF4', border: '1px solid #BBF7D0' };

  return (
    <AnimatePresence>
      {sub && (
        <>
          <motion.div
            key="preview-bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/60 z-[400]"
            onClick={onClose}
          />
          <motion.div
            key="preview-modal"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[401] flex items-start justify-center overflow-y-auto p-4"
            onClick={onClose}
          >
            <div
              className="bg-white rounded-lg shadow-[0_24px_64px_rgba(0,0,0,0.22)] w-full max-w-lg my-8 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Banner */}
              <div className="relative h-44 bg-primary-light flex items-center justify-center overflow-hidden">
                {sub.bannerImage?.url
                  ? <img src={sub.bannerImage.url} alt={sub.eventName} className="w-full h-full object-cover" />
                  : <ClipboardList size={64} strokeWidth={1.25} className="text-primary/40" />
                }
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/50 text-white text-[10px] font-bold rounded-md tracking-wide uppercase">
                  Admin Preview · {sub.status}
                </span>
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                  aria-label="Close preview"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Category + entry type */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-primary tracking-wider uppercase">{sub.eventType}</span>
                  <span className="text-text-4">·</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md" style={entryStyle}>
                    {entryLabel}
                  </span>
                </div>

                {/* Event name */}
                <h2 className="font-display font-bold text-[22px] text-text-1 leading-tight tracking-tight">
                  {sub.eventName}
                </h2>

                {/* Location + date */}
                <div className="space-y-1.5 text-[13px] text-text-2">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0 text-text-3" />
                    <span>{sub.college}{sub.city ? `, ${sub.city}` : ''}{sub.venue ? ` · ${sub.venue}` : ''}</span>
                  </div>
                  {sub.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} strokeWidth={2} className="flex-shrink-0 text-text-3" />
                      <span>{sub.startDate}</span>
                    </div>
                  )}
                  {sub.teamSize && (
                    <div className="flex items-center gap-2">
                      <Users size={14} strokeWidth={2} className="flex-shrink-0 text-text-3" />
                      <span>Team size: {sub.teamSize}</span>
                    </div>
                  )}
                </div>

                {/* About */}
                {sub.about && (
                  <div>
                    <div className="text-[11px] font-bold text-text-3 uppercase tracking-wide mb-1.5">About</div>
                    <p className="text-[13px] text-text-2 leading-relaxed">{sub.about}</p>
                  </div>
                )}

                {/* Registration URL */}
                {sub.registrationUrl && (
                  <div>
                    <div className="text-[11px] font-bold text-text-3 uppercase tracking-wide mb-1">Registration Link</div>
                    <a
                      href={sub.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] text-primary underline break-all"
                      onClick={e => e.stopPropagation()}
                    >
                      {sub.registrationUrl}
                    </a>
                  </div>
                )}

                {/* Submitted by */}
                <div className="pt-3 border-t border-border">
                  <div className="text-[11px] font-bold text-text-3 uppercase tracking-wide mb-1">Submitted By</div>
                  <div className="text-[13px] text-text-2">
                    {sub.submittedBy?.name || '—'}
                    {sub.submittedBy?.email && <span className="text-text-3"> · {sub.submittedBy.email}</span>}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 border-[1.5px] border-border rounded-lg text-[13px] font-semibold text-text-2 hover:bg-surface-2 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════
   SUBMISSIONS TAB
═══════════════════════════════════════════════════════ */
function SubmissionsTab({ showToast }) {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [previewSub,    setPreviewSub]    = useState(null);
  const [markAsFeatured, setMarkAsFeatured] = useState(false);

  const load = useCallback((status = filter) => {
    setLoading(true);
    admin.submissions({ status, limit: 50 })
      .then(r => setItems(r.data.submissions || []))
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(filter); }, [filter]);

  const approve = async (id) => {
    setActionLoading(id + '-approve');
    try {
      await admin.approveSubmission(id, { isFeatured: markAsFeatured });
      showToast(`Event approved and published${markAsFeatured ? ' as Featured' : ''}!`, 'success');
      setMarkAsFeatured(false);
      load(filter);
      setSelected(null);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionLoading(''); }
  };

  const reject = async (id) => {
    if (!rejectReason.trim()) { showToast('Please enter a rejection reason', 'error'); return; }
    setActionLoading(id + '-reject');
    try {
      await admin.rejectSubmission(id, rejectReason);
      showToast('Submission rejected', 'info');
      setRejectReason('');
      setMarkAsFeatured(false);
      load(filter);
      setSelected(null);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionLoading(''); }
  };

  const handlePreview = (s) => {
    if (s.linkedEvent?.slug) {
      navigate(`/event/${s.linkedEvent.slug}`);
    } else if (s.eventName) {
      setPreviewSub(s);
    } else {
      showToast('Preview is not available for this submission', 'error');
    }
  };

  const statusColor = { pending: 'amber', approved: 'green', rejected: 'red' };

  return (
    <div className="space-y-4">
      <SubmissionPreviewModal sub={previewSub} onClose={() => setPreviewSub(null)} />

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['pending','approved','rejected','all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-[12px] font-semibold border transition-all ${filter === s ? 'bg-primary text-white border-primary' : 'bg-white text-text-2 border-border hover:border-primary-mid'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState icon={<ClipboardList size={40} strokeWidth={1.5} />} title={`No ${filter} submissions`} />
        : (
          <div className="space-y-3">
            {items.map(s => (
              <motion.div key={s._id} layout
                className="bg-white border border-border rounded-lg p-4 shadow-1 cursor-pointer hover:border-primary-mid transition-colors"
                onClick={() => setSelected(selected?._id === s._id ? null : s)}>
                <div className="flex items-start gap-3">
                  {/* Banner thumbnail or placeholder */}
                  <div className="w-12 h-12 rounded-md bg-primary-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {s.bannerImage?.url
                      ? <img src={s.bannerImage.url} alt="" className="w-full h-full object-cover" />
                      : <ClipboardList size={22} strokeWidth={1.75} className="text-primary/60" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[14px] text-text-1">{s.eventName}</span>
                      <Badge color={statusColor[s.status] || 'gray'}>{s.status}</Badge>
                    </div>
                    <div className="text-[12px] text-text-3 mt-0.5">{s.college} · {s.city} · {s.startDate}</div>
                    <div className="text-[12px] text-text-3">By: {s.submittedBy?.name || '—'} ({s.submittedBy?.email || '—'})</div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {s.isPaid    && <span className="text-[11px] text-amber font-medium">₹{s.entryFee} entry</span>}
                      {s.hasPrize  && <span className="text-[11px] text-[#16A34A] font-medium inline-flex items-center gap-1"><Trophy size={11} strokeWidth={2} /> Prize</span>}
                      {s.venue     && <span className="text-[11px] text-text-3">{s.venue}</span>}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-text-3 flex-shrink-0 transition-transform ${selected?._id === s._id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {selected?._id === s._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        {s.about && (
                          <div>
                            <div className="text-[11px] font-bold text-text-3 uppercase tracking-wide mb-1">About</div>
                            <div className="text-[13px] text-text-2 leading-relaxed">{s.about}</div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                          <div><span className="text-text-3">Team size:</span> <span className="text-text-1 font-medium">{s.teamSize || '—'}</span></div>
                          <div><span className="text-text-3">Event type:</span> <span className="text-text-1 font-medium">{s.eventType}</span></div>
                          {s.registrationUrl && (
                            <div className="col-span-2"><span className="text-text-3">Reg URL:</span> <a href={s.registrationUrl} target="_blank" rel="noreferrer" className="text-primary underline ml-1 break-all">{s.registrationUrl}</a></div>
                          )}
                        </div>

                        <div className="pt-1">
                          <Btn variant="ghost" onClick={(e) => { e.stopPropagation(); handlePreview(s); }}>
                            <Eye size={13} strokeWidth={2} /> Preview
                          </Btn>
                        </div>

                        {s.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            {isSuperAdmin && (
                              <label
                                className="flex items-center gap-2.5 px-3 py-2.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-md cursor-pointer"
                                onClick={e => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={markAsFeatured}
                                  onChange={e => setMarkAsFeatured(e.target.checked)}
                                  className="w-4 h-4 accent-primary flex-shrink-0"
                                />
                                <span className="text-[12px] font-semibold text-[#B45309] inline-flex items-center gap-1.5">
                                  <Star size={13} strokeWidth={2} /> Mark as Featured Event
                                </span>
                              </label>
                            )}
                            <Btn variant="success" onClick={(e) => { e.stopPropagation(); approve(s._id); }} loading={actionLoading === s._id + '-approve'}>
                              <CheckCircle2 size={13} strokeWidth={2} /> Approve & Publish
                            </Btn>
                            <div className="flex gap-2 items-start">
                              <input
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                onClick={e => e.stopPropagation()}
                                placeholder="Rejection reason (required)"
                                className="flex-1 text-[12px] px-3 py-2 border border-border rounded-md bg-white focus:border-primary outline-none"
                              />
                              <Btn variant="danger" onClick={(e) => { e.stopPropagation(); reject(s._id); }} loading={actionLoading === s._id + '-reject'}>
                                Reject
                              </Btn>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EVENTS TAB
═══════════════════════════════════════════════════════ */
function EventsTab({ showToast }) {
  const navigate = useNavigate();
  // Read currentUser directly from context — never use a stale prop
  const { currentUser } = useApp();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // ev to hard-delete

  const isSuperAdmin = currentUser?.role === 'superadmin';

  const load = useCallback(() => {
    setLoading(true);
    admin.listEvents({ limit: 50, search: search || undefined })
      .then(r => setItems(r.data.events || []))
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);

  const softDelete = async (id) => {
    setActionId(id + '-del');
    try { await admin.deleteEvent(id); showToast('Event deactivated', 'info'); load(); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(''); }
  };

  const restore = async (id) => {
    setActionId(id + '-res');
    try { await admin.restoreEvent(id); showToast('Event restored', 'success'); load(); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(''); }
  };

  const hardDelete = async (ev) => {
    setConfirmDelete(null);
    setActionId(ev._id + '-hd');
    try {
      await admin.hardDeleteEvent(ev._id);
      showToast(`"${ev.name}" permanently deleted`, 'info');
      load();
    }
    catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(''); }
  };

  const toggleFeature = async (id, currentFeatured) => {
    setActionId(id + '-feat');
    try {
      await admin.featureEvent(id, !currentFeatured);
      showToast(!currentFeatured ? 'Event marked as Featured' : 'Event removed from Featured', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(''); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
            className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-md bg-white focus:border-primary outline-none" />
        </div>
      </div>

      {/* Hard-delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[300]" onClick={() => setConfirmDelete(null)} />
            <motion.div key="modal" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[301] flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.20)] max-w-sm w-full p-6">
                <div className="mb-3 text-red"><Trash2 size={28} strokeWidth={1.75} /></div>
                <div className="font-display font-bold text-[16px] text-text-1 mb-2">Permanently delete event?</div>
                <div className="text-[13px] text-text-3 mb-1">
                  <span className="font-semibold text-text-1">"{confirmDelete.name}"</span> will be removed forever along with all saves and registrations.
                </div>
                <div className="text-[12px] text-red font-semibold mb-5">This action cannot be undone.</div>
                <div className="flex gap-3">
                  <Btn variant="ghost" size="md" onClick={() => setConfirmDelete(null)}>Cancel</Btn>
                  <Btn variant="danger" size="md" onClick={() => hardDelete(confirmDelete)} loading={actionId === confirmDelete._id + '-hd'}>
                    Delete Permanently
                  </Btn>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState icon={<CalendarDays size={40} strokeWidth={1.5} />} title="No events found" />
        : (
          <div className="space-y-2">
            {items.map(ev => (
              <div key={ev._id} className={`bg-white border rounded-lg p-4 shadow-1 ${!ev.isActive ? 'opacity-60 border-border' : 'border-border'}`}>
                {/* Identity row */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center text-xl flex-shrink-0 mt-0.5 ${ev.bgClass || 'bg1'}`}>{ev.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-[14px] text-text-1 truncate">{ev.name}</span>
                      {!ev.isActive && <Badge color="gray">Inactive</Badge>}
                      <Badge color="indigo">{ev.category}</Badge>
                      {ev.isFeatured && <Badge color="amber"><Star size={10} strokeWidth={2} className="mr-1" /> Featured</Badge>}
                    </div>
                    <div className="text-[12px] text-text-3 truncate">{ev.college} · {ev.city}</div>
                    <div className="text-[11px] text-text-3 mt-0.5">{ev.date?.start} · {ev.stats?.registrationCount ?? 0} regs · {ev.stats?.viewCount ?? 0} views</div>
                  </div>
                </div>
                {/* Actions row */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border flex-wrap">
                  <Btn variant="ghost" onClick={() => navigate(`/event/${ev.slug}`)}>View</Btn>
                  {isSuperAdmin && (
                    <Btn
                      variant={ev.isFeatured ? 'success' : 'ghost'}
                      onClick={() => toggleFeature(ev._id, ev.isFeatured)}
                      loading={actionId === ev._id + '-feat'}
                    >
                      <Star size={12} strokeWidth={2} fill={ev.isFeatured ? 'currentColor' : 'none'} />
                      {ev.isFeatured ? 'Featured' : 'Feature'}
                    </Btn>
                  )}
                  <div className="ml-auto flex items-center gap-1.5">
                    {ev.isActive
                      ? <Btn variant="danger" onClick={() => softDelete(ev._id)} loading={actionId === ev._id + '-del'}>Deactivate</Btn>
                      : <Btn variant="success" onClick={() => restore(ev._id)} loading={actionId === ev._id + '-res'}>Restore</Btn>
                    }
                    {isSuperAdmin && (
                      <Btn variant="danger" onClick={() => setConfirmDelete(ev)} loading={actionId === ev._id + '-hd'}>
                        <Trash2 size={12} strokeWidth={2} /> Delete
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   USERS TAB
═══════════════════════════════════════════════════════ */
const USER_ROLE_FILTERS = [
  { label: 'All',        value: ''           },
  { label: 'Students',   value: 'user'       },
  { label: 'Organizers', value: 'organizer'  },
];

function UsersTab({ showToast }) {
  const [items,      setItems]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionId,   setActionId]   = useState('');

  const load = useCallback(() => {
    setLoading(true);
    admin.listUsers({ limit: 50, search: search || undefined, role: roleFilter || undefined })
      .then(r => setItems(r.data.users || []))
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search, roleFilter]);

  const toggleBan = async (id, isBanned) => {
    setActionId(id);
    try {
      await admin.toggleBan(id);
      showToast(isBanned ? 'User unbanned' : 'User banned', isBanned ? 'success' : 'info');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(''); }
  };

  const roleColor  = { user: 'gray', organizer: 'indigo', admin: 'indigo', superadmin: 'amber' };
  const roleLabel  = { user: 'Student', organizer: 'Organizer', admin: 'Admin', superadmin: 'Super Admin' };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-md bg-white focus:border-primary outline-none" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2">
        {USER_ROLE_FILTERS.map(f => (
          <button key={f.value} onClick={() => setRoleFilter(f.value)}
            className={`px-3 py-1.5 rounded-md text-[12px] font-semibold border transition-colors
                        ${roleFilter === f.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-text-2 border-border hover:border-primary/40 hover:text-primary'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState icon={<Users size={40} strokeWidth={1.5} />} title="No users found" />
        : (
          <div className="space-y-2">
            {items.map(u => (
              <div key={u._id} className={`bg-white border border-border rounded-lg p-4 shadow-1 ${u.isBanned ? 'opacity-60' : ''}`}>
                {/* Identity row */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-[12px] font-bold text-primary flex-shrink-0">
                    {u.avatar?.initials || u.name?.slice(0,2).toUpperCase() || '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[13px] text-text-1">{u.name}</span>
                      <Badge color={roleColor[u.role] || 'gray'}>{roleLabel[u.role] || u.role}</Badge>
                      {u.isBanned && <Badge color="red">Banned</Badge>}
                    </div>
                    <div className="text-[11px] text-text-3 truncate mt-0.5">{u.email}</div>
                    {(u.organization || u.college) && (
                      <div className="text-[12px] text-text-2 font-medium truncate mt-0.5">
                        {u.organization || u.college}
                        {u.role === 'organizer' && u.designation ? ` · ${u.designation}` : ''}
                      </div>
                    )}
                  </div>
                </div>
                {/* Actions row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="text-[11px] text-text-3">
                    {u.points ?? 0} pts
                    {u.createdAt && <> · joined {new Date(u.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</>}
                  </div>
                  {u.role !== 'superadmin' && (
                    <Btn variant={u.isBanned ? 'success' : 'danger'} size="sm"
                      onClick={() => toggleBan(u._id, u.isBanned)} loading={actionId === u._id}>
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TICKETS TAB
═══════════════════════════════════════════════════════ */
function TicketsTab({ showToast }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionId, setActionId] = useState('');

  const load = useCallback((status = filter) => {
    setLoading(true);
    admin.tickets({ status, limit: 50 })
      .then(r => setItems(r.data.tickets || []))
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(filter); }, [filter]);
  useEffect(() => { setAdminNote(''); }, [selected?._id]);

  const updateStatus = async (id, status) => {
    if (status === 'resolved' && !adminNote.trim()) {
      showToast('A response message is required to resolve a ticket', 'error');
      return;
    }
    setActionId(id + status);
    try {
      await admin.updateTicket(id, { status, adminNote });
      showToast(`Ticket marked as ${status}`, 'success');
      setAdminNote('');
      load(filter);
      setSelected(null);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(''); }
  };

  const statusColor = { open: 'red', in_progress: 'amber', resolved: 'green' };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['open','in_progress','resolved'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-[12px] font-semibold border transition-all ${filter === s ? 'bg-primary text-white border-primary' : 'bg-white text-text-2 border-border hover:border-primary-mid'}`}>
            {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : items.length === 0
        ? <EmptyState icon={<Ticket size={40} strokeWidth={1.5} />} title={`No ${filter.replace('_',' ')} tickets`} />
        : (
          <div className="space-y-2">
            {items.map(t => (
              <motion.div key={t._id} layout
                className="bg-white border border-border rounded-lg p-4 shadow-1 cursor-pointer hover:border-primary-mid transition-colors"
                onClick={() => setSelected(selected?._id === t._id ? null : t)}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5 text-text-3"><Ticket size={16} strokeWidth={2} /></div>
                  <div className="flex-1 min-w-0">
                    {/* ID + status */}
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-mono text-[11px] font-bold text-text-4">#{t._id.slice(-6).toUpperCase()}</span>
                      <Badge color={statusColor[t.status] || 'gray'}>{t.status?.replace('_',' ')}</Badge>
                    </div>
                    {/* Subject */}
                    <div className="font-semibold text-[13px] text-text-1 truncate">{t.subject}</div>
                    {/* Name + role */}
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[12px] text-text-2 font-medium">{t.user?.name || t.name}</span>
                      {(t.user?.role || null) && (
                        <Badge color={t.user.role === 'organizer' ? 'indigo' : 'gray'}>
                          {t.user.role === 'organizer' ? 'Organizer' : t.user.role === 'admin' ? 'Admin' : 'Student'}
                        </Badge>
                      )}
                      {!t.user && <Badge color="gray">Guest</Badge>}
                    </div>
                    {/* Email + created date */}
                    <div className="text-[11px] text-text-3 mt-0.5">
                      {t.email}
                      {t.createdAt && (
                        <span className="text-text-4"> · {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-text-3 flex-shrink-0 transition-transform mt-1 ${selected?._id === t._id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>

                <AnimatePresence>
                  {selected?._id === t._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        {/* User message */}
                        <div>
                          <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-1.5">User Message</div>
                          <div className="text-[13px] text-text-2 bg-surface-2 rounded-md p-3 leading-relaxed">{t.message}</div>
                        </div>

                        {/* Existing reply thread */}
                        {t.replies?.length > 0 && (
                          <div>
                            <div className="text-[10px] font-bold text-text-4 uppercase tracking-wide mb-1.5">Conversation</div>
                            <div className="space-y-2">
                              {t.replies.map((r, i) => (
                                <div key={i} className="bg-primary-light border border-[#C7D2FE] rounded-md p-3">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">FN</div>
                                    <span className="text-[11px] font-bold text-primary">{r.name || 'FestNest Team'}</span>
                                    <span className="text-[10px] text-text-4 ml-auto">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  </div>
                                  <p className="text-[12px] text-primary/90 leading-relaxed">{r.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Response composer */}
                        <div onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1 mb-1.5">
                            <span className="text-[10px] font-bold text-text-4 uppercase tracking-wide">Response</span>
                            {t.status !== 'resolved' && (
                              <span className="text-[10px] text-red font-semibold">* required to resolve</span>
                            )}
                          </div>
                          <textarea
                            value={adminNote}
                            onChange={e => setAdminNote(e.target.value)}
                            placeholder="Write your response to the user…"
                            className="w-full text-[12px] px-3 py-2 border border-border rounded-md bg-white focus:border-primary outline-none resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                          {t.status !== 'in_progress' && <Btn variant="ghost" onClick={() => updateStatus(t._id, 'in_progress')} loading={actionId === t._id + 'in_progress'}>Mark In Progress</Btn>}
                          {t.status !== 'resolved'    && <Btn variant="success" onClick={() => updateStatus(t._id, 'resolved')} loading={actionId === t._id + 'resolved'}><CheckCircle2 size={13} strokeWidth={2} /> Resolve & Send Response</Btn>}
                          {t.status !== 'open'        && <Btn variant="danger" onClick={() => updateStatus(t._id, 'open')} loading={actionId === t._id + 'open'}>Reopen</Btn>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BROADCAST TAB
═══════════════════════════════════════════════════════ */
function BroadcastTab({ showToast }) {
  const [form, setForm] = useState({ title: '', sub: '', type: 'system', icon: '📢' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null);

  const send = async () => {
    if (!form.title.trim()) { showToast('Title is required', 'error'); return; }
    setLoading(true);
    try {
      const r = await admin.notify(form);
      setSent(r.data.sent);
      showToast(`Notification sent to ${r.data.sent} users`, 'success');
      setForm({ title: '', sub: '', type: 'system', icon: '📢' });
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const ICONS = ['📢','🎉','🚨','🏆','⚡','🔔','🪺','🎓','✅','⚠️'];

  return (
    <div className="max-w-lg space-y-4">
      <div className="bg-white border border-border rounded-lg p-5 shadow-1 space-y-4">
        <SectionHeader title="Broadcast Notification" sub="Send a push notification to all users" />

        {/* Icon picker */}
        <div>
          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wide block mb-2">Icon</label>
          <div className="flex gap-2 flex-wrap">
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                className={`w-9 h-9 rounded-md text-xl flex items-center justify-center border transition-all ${form.icon === ic ? 'border-primary bg-primary-light scale-110' : 'border-border bg-surface-2 hover:border-primary-mid'}`}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wide block mb-2">Type</label>
          <div className="flex gap-2">
            {['system','updates','deadlines'].map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold border transition-all ${form.type === t ? 'bg-primary text-white border-primary' : 'bg-white text-text-2 border-border'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wide block mb-1.5">Title *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="e.g. New hackathons added this week!"
            className="w-full px-3 py-2.5 text-[13px] border border-border rounded-md bg-white focus:border-primary outline-none" />
        </div>

        {/* Sub */}
        <div>
          <label className="text-[11px] font-bold text-text-3 uppercase tracking-wide block mb-1.5">Subtitle</label>
          <input value={form.sub} onChange={e => setForm(f => ({ ...f, sub: e.target.value }))}
            placeholder="Optional supporting text…"
            className="w-full px-3 py-2.5 text-[13px] border border-border rounded-md bg-white focus:border-primary outline-none" />
        </div>

        {/* Preview */}
        <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-lg p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">{form.icon}</div>
          <div>
            <div className="font-semibold text-[13px] text-text-1">{form.title || 'Your title here'}</div>
            <div className="text-[12px] text-text-3 mt-0.5">{form.sub || 'Optional subtitle…'}</div>
          </div>
        </div>

        <Btn variant="primary" size="md" onClick={send} loading={loading}>
          <Send size={14} strokeWidth={2} /> Send to All Users
        </Btn>

        {sent !== null && (
          <div className="text-[12px] text-[#16A34A] font-medium inline-flex items-center gap-1.5"><CheckCircle2 size={13} strokeWidth={2} /> Sent to {sent} user(s)</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURED TAB  (Super Admin only)
═══════════════════════════════════════════════════════ */
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
// Gold / silver / bronze medal colours for the top three positions
const RANK_COLORS = ['text-[#D4A017]', 'text-[#9CA3AF]', 'text-[#B08D57]'];
const ordinal = n => ORDINALS[n - 1] || `${n}th`;

function FeaturedTab({ showToast }) {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [actionId, setActionId] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    eventsApi.featured()
      .then(r => {
        const evs = normaliseEvents(r.data?.events || []);
        evs.sort((a, b) => a.featuredOrder - b.featuredOrder);
        setItems(evs);
      })
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!isSuperAdmin) return (
    <EmptyState icon={<Lock size={40} strokeWidth={1.5} />} title="Super Admin only" sub="You need super admin privileges to manage featured events." />
  );

  const changePosition = async (eventId, newRank) => {
    const moving  = items.find(ev => ev._id === eventId);
    const without = items.filter(ev => ev._id !== eventId);
    without.splice(newRank - 1, 0, moving);
    setActionId(eventId + '-pos');
    try {
      await Promise.all(without.map((ev, i) => admin.featureEvent(ev._id, true, i + 1)));
      showToast('Priority updated', 'success');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(''); }
  };

  const removeFromFeatured = async (eventId) => {
    setActionId(eventId + '-remove');
    try {
      await admin.featureEvent(eventId, false);
      showToast('Removed from Featured', 'info');
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setActionId(''); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Featured Events"
        sub={`${items.length} event${items.length !== 1 ? 's' : ''} featured · 1st position appears first in the "For You" feed and sidebars`}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Star size={40} strokeWidth={1.5} />}
          title="No featured events"
          sub='Feature events from the Events tab using the "Feature" button.'
        />
      ) : (
        <div className="space-y-3">
          {items.map((ev, idx) => {
            const rank = idx + 1;
            const isActing = actionId.startsWith(ev._id);
            return (
              <div key={ev._id} className="bg-white border border-border rounded-lg p-4 shadow-1">
                {/* Identity row */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-7 flex justify-center text-[13px] font-bold text-text-3 leading-none select-none">
                    {idx < 3 ? <Medal size={20} strokeWidth={2} className={RANK_COLORS[idx]} /> : `${rank}.`}
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${ev.bg || 'bg1'} flex items-center justify-center text-[18px] flex-shrink-0 overflow-hidden`}>
                    {ev.imageUrl
                      ? <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover" />
                      : (ev.emoji || '🎉')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] text-text-1 truncate">{ev.name}</div>
                    <div className="text-[12px] text-text-3 truncate">{ev.college} · {ev.city}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge color="indigo">{ev.category}</Badge>
                      <Badge color="amber"><Star size={10} strokeWidth={2} className="mr-1" /> {ordinal(rank)}</Badge>
                    </div>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <select
                    value={rank}
                    disabled={isActing || items.length === 1}
                    onChange={e => changePosition(ev._id, Number(e.target.value))}
                    className="flex-1 min-w-0 px-2 py-1.5 text-[12px] border border-border rounded-md bg-white text-text-2 font-semibold focus:border-primary outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Change priority position"
                  >
                    {items.map((_, i) => (
                      <option key={i + 1} value={i + 1}>{ordinal(i + 1)} Position</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Btn variant="ghost" size="sm"
                      onClick={() => navigate(`/event/${ev.slug || ev.id}`)}>
                      View
                    </Btn>
                    <Btn variant="danger" size="sm"
                      onClick={() => removeFromFeatured(ev._id)}
                      loading={actionId === ev._id + '-remove'}
                      disabled={isActing}>
                      Remove
                    </Btn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-[12px] text-text-3 px-1 flex items-start gap-1.5">
          <Lightbulb size={13} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
          <span>Use the position dropdown to reorder. 1st appears first in feeds; up to 6 events can be featured.</span>
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD
═══════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, isLoggedIn, currentUser, showToast, refreshUser } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  // Guard
  useEffect(() => {
    if (!isLoggedIn)  { navigate('/'); return; }
    if (!isAdmin)     { navigate('/'); showToast('Admin access required', 'error'); }
  }, [isLoggedIn, isAdmin, navigate, showToast]);

  // Refresh user role from backend on mount — catches stale localStorage roles
  useEffect(() => {
    if (isLoggedIn) refreshUser();
  }, [isLoggedIn]);

  if (!isLoggedIn || !isAdmin) return null;

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const visibleTabs  = TABS.filter(t => !t.superAdminOnly || isSuperAdmin);
  const tabProps = { showToast };

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }} className="min-h-screen bg-surface-2 w-full overflow-x-hidden">

      {/* ── Admin header bar ── */}
      <div className="bg-white border-b border-border sticky top-0 z-10 shadow-1">
        <div className="px-4 py-3 md:px-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] text-text-1 leading-none">Admin Dashboard</div>
            <div className="text-[11px] text-text-3">{currentUser?.name} · {currentUser?.role}</div>
          </div>
          <button onClick={() => navigate('/')}
            className="text-[12px] font-medium text-text-3 hover:text-primary flex items-center gap-1 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Back to App
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto no-scrollbar border-t border-border">
          {visibleTabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold whitespace-nowrap border-b-2 transition-all flex-shrink-0
                          ${activeTab === t.id ? 'border-primary text-primary bg-primary-light' : 'border-transparent text-text-3 hover:text-text-1 hover:bg-surface-2'}`}>
              <t.Icon size={14} strokeWidth={1.8} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="p-4 md:p-6 max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {activeTab === 'overview'    && <OverviewTab       {...tabProps} />}
            {activeTab === 'submissions' && <SubmissionsTab    {...tabProps} />}
            {activeTab === 'events'      && <EventsTab         {...tabProps} />}
            {activeTab === 'users'       && <UsersTab          {...tabProps} />}
            {activeTab === 'tickets'     && <TicketsTab        {...tabProps} />}
            {activeTab === 'featured'    && <FeaturedTab       {...tabProps} />}
            {activeTab === 'notify'      && <BroadcastTab      {...tabProps} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
