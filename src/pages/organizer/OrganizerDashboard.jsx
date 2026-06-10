// src/pages/organizer/OrganizerDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CalendarDays, Lightbulb, Clock, CheckCircle2, XCircle,
  Filter, Star, Plus, User, Camera, Target, Trophy, Link2, ClipboardList,
  PenLine, Phone, FileText, MapPin, Tag, Users, IndianRupee, Mail,
  Code2, Music4, Wrench, Mic, Zap, PartyPopper, Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { users as usersApi, events as eventsApi } from '../../services/api';
import FeaturedEventCard from '../../components/FeaturedEventCard';
import { normaliseEvents } from '../../services/normalise';

/* ══════════════════════════════════════════════════
   EVENT TYPE → ICON + BG
══════════════════════════════════════════════════ */
const TYPE_ICON_STYLE = {
  Hackathon:       { Icon: Code2,       cls: 'bg1 text-[#4338CA]' },
  'Cultural Fest': { Icon: Music4,      cls: 'bg5 text-[#9333EA]' },
  Workshop:        { Icon: Wrench,      cls: 'bg3 text-[#0D9488]' },
  Competition:     { Icon: Trophy,      cls: 'bg7 text-[#D97706]' },
  'Tech Talk':     { Icon: Mic,         cls: 'bg8 text-[#1D4ED8]' },
  Sports:          { Icon: Zap,         cls: 'bg4 text-[#16A34A]' },
  Other:           { Icon: PartyPopper, cls: 'bg2 text-[#EA580C]' },
};

/* ══════════════════════════════════════════════════
   SHARED ATOMS
══════════════════════════════════════════════════ */
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 rounded-full border-[3px] border-[#E4E4E0]" />
      <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
    </div>
  </div>
);

const Empty = ({ Icon: EIcon, title, sub, action, onAction }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center py-16 text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mb-4
                    shadow-[0_0_0_6px_rgba(79,70,229,0.08)]">
      <EIcon size={32} strokeWidth={1.8} className="text-primary" />
    </div>
    <div className="font-display font-bold text-[16px] text-text-1 mb-1.5">{title}</div>
    {sub && <div className="text-[13px] text-text-3 mb-6 max-w-[260px] leading-relaxed">{sub}</div>}
    {action && (
      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onAction}
        className="px-6 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold
                   hover:bg-primary-dark hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all">
        {action}
      </motion.button>
    )}
  </motion.div>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending:  { cls: 'bg-amber-bg text-amber border-amber-border',     Icon: Clock,        label: 'Under Review' },
    approved: { cls: 'bg-green-bg text-[#16A34A] border-green-border', Icon: CheckCircle2, label: 'Live' },
    rejected: { cls: 'bg-red-bg text-red border-red-border',           Icon: XCircle,      label: 'Rejected' },
  };
  const { cls, Icon: BadgeIcon, label } = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${cls}`}>
      <BadgeIcon size={11} strokeWidth={2} />
      {label}
    </span>
  );
};

const StatCard = ({ Icon: CardIcon, label, value, color = 'indigo', sub }) => {
  const bg = {
    indigo: 'bg-primary-light text-primary',
    green:  'bg-green-bg text-[#16A34A]',
    amber:  'bg-amber-bg text-amber',
    red:    'bg-red-bg text-red',
    purple: 'bg-[#F5F3FF] text-[#7C3AED]',
  };
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
      className="bg-white border border-border rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg[color]}`}>
          <CardIcon size={17} strokeWidth={1.8} />
        </div>
      </div>
      <div className="text-[28px] font-display font-bold text-text-1 leading-none mb-1">
        {value ?? '—'}
      </div>
      <div className="text-[12px] text-text-3 font-medium">{label}</div>
      {sub && <div className="text-[11px] text-text-4 mt-0.5">{sub}</div>}
    </motion.div>
  );
};

const InfoChip = ({ Icon: ChipIcon, text }) => !text ? null : (
  <span className="flex items-center gap-1 text-[11px] text-text-3 whitespace-nowrap">
    <ChipIcon size={11} strokeWidth={1.8} className="flex-shrink-0" />
    {text}
  </span>
);

/* ══════════════════════════════════════════════════
   EVENT CARD
══════════════════════════════════════════════════ */
function EventCard({ ev, onView, expanded, onToggle, navigate, showToast }) {
  const typeStyle = TYPE_ICON_STYLE[ev.eventType] || TYPE_ICON_STYLE.Other;
  const TypeIcon  = typeStyle.Icon;

  const copyLink = async () => {
    const link = ev.registrationUrl || '';
    if (!link || link === '#') { showToast('No registration link added', 'info'); return; }
    try { await navigator.clipboard.writeText(link); showToast('Link copied!', 'success'); }
    catch { showToast('Could not copy link', 'error'); }
  };

  return (
    <motion.div layout
      className="bg-white border border-border rounded-2xl overflow-hidden
                 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
                 hover:border-primary/20 transition-all duration-200">

      {/* Card header */}
      <div className="flex items-start gap-3 p-4 cursor-pointer select-none" onClick={onToggle}>
        {ev.bannerImage?.url ? (
          <img src={ev.bannerImage.url} alt={ev.eventName}
            className="w-[52px] h-[52px] rounded-xl object-cover flex-shrink-0 border border-border" />
        ) : (
          <div className={`w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0 ${typeStyle.cls}`}>
            <TypeIcon size={26} strokeWidth={1.8} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[14px] text-text-1 leading-snug line-clamp-1">
                {ev.eventName}
              </div>
              <div className="text-[11px] text-text-3 mt-0.5 truncate">{ev.college}</div>
            </div>
            <StatusBadge status={ev.status} />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <InfoChip Icon={CalendarDays} text={ev.startDate} />
            <InfoChip Icon={Tag}          text={ev.eventType} />
            {ev.city && <InfoChip Icon={MapPin} text={ev.city} />}
          </div>
        </div>

        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-1 ml-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-4">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </motion.div>
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-border">
            <div className="p-4 space-y-3">

              {/* Status alerts */}
              {ev.status === 'pending' && (
                <div className="flex items-start gap-2.5 bg-amber-bg border border-amber-border rounded-xl p-3">
                  <Clock size={18} strokeWidth={1.8} className="text-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[12px] font-bold text-amber">Under Review</div>
                    <div className="text-[12px] text-text-2 mt-0.5 leading-relaxed">
                      Our team reviews submitted events within 24 hours.
                    </div>
                  </div>
                </div>
              )}
              {ev.status === 'approved' && (
                <div className="flex items-start gap-2.5 bg-green-bg border border-green-border rounded-xl p-3">
                  <PartyPopper size={18} strokeWidth={1.8} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[12px] font-bold text-[#16A34A]">Live on FestNest</div>
                    <div className="text-[12px] text-text-2 mt-0.5 leading-relaxed">
                      Visible to 48,000+ students across India.
                    </div>
                  </div>
                </div>
              )}
              {ev.status === 'rejected' && (
                <div className="flex items-start gap-2.5 bg-red-bg border border-red-border rounded-xl p-3">
                  <XCircle size={18} strokeWidth={1.8} className="text-red flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[12px] font-bold text-red">Not Approved</div>
                    <div className="text-[12px] text-text-2 mt-0.5 leading-relaxed">
                      Review our guidelines and resubmit your event.
                    </div>
                  </div>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  ev.startDate  && [CalendarDays, 'Start date', ev.startDate],
                  ev.endDate    && [CalendarDays, 'End date',   ev.endDate],
                  ev.venue      && [MapPin,       'Venue',      ev.venue],
                  ev.mode       && [MapPin,       'Mode',       ev.mode],
                  ev.teamSize   && [Users,        'Team size',  ev.teamSize],
                  ev.entryFee   && [IndianRupee,  'Entry fee',  `₹${ev.entryFee}`],
                  ev.totalPrize && [Trophy,       'Prize pool', `₹${ev.totalPrize}`],
                  ev.pocName    && [User,         'POC',        ev.pocName],
                  ev.pocEmail   && [Mail,         'Email',      ev.pocEmail],
                  ev.pocPhone   && [Phone,        'Phone',      ev.pocPhone],
                ].filter(Boolean).map(([DIcon, label, value], i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[12px]">
                    <DIcon size={12} strokeWidth={1.8} className="text-text-3 flex-shrink-0" />
                    <span className="text-text-3">{label}:</span>
                    <span className="text-text-1 font-medium truncate">{value}</span>
                  </div>
                ))}
              </div>

              {/* Prize breakdown */}
              {(ev.prize1 || ev.prize2 || ev.prize3) && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '1st', amt: ev.prize1, cls: 'text-[#B45309]', bg: 'bg-[#FFFBEB] border-[#FDE68A]' },
                    { label: '2nd', amt: ev.prize2, cls: 'text-[#475569]', bg: 'bg-[#F8F8F6] border-[#E2E8F0]' },
                    { label: '3rd', amt: ev.prize3, cls: 'text-[#9A3412]', bg: 'bg-[#FFF7ED] border-[#FED7AA]' },
                  ].map(({ label, amt, cls, bg }) =>
                    amt ? (
                      <div key={label} className={`border rounded-xl p-2.5 text-center ${bg}`}>
                        <div className={`text-[12px] font-bold ${cls}`}>{label}</div>
                        <div className={`text-[12px] font-bold mt-0.5 ${cls}`}>₹{amt}</div>
                      </div>
                    ) : null
                  )}
                </div>
              )}

              {/* About snippet */}
              {ev.about && (
                <div className="bg-surface-2 rounded-xl p-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-text-4 mb-1.5">About</div>
                  <p className="text-[12px] text-text-2 leading-relaxed line-clamp-3">{ev.about}</p>
                </div>
              )}

              {/* CTA row */}
              <div className="flex gap-2 pt-1">
                {ev.status === 'approved' && ev.linkedEvent && (
                  <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={() => onView(ev.linkedEvent)}
                    className="flex-1 py-2.5 bg-primary text-white rounded-xl text-[12px] font-bold
                               hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View Live
                  </motion.button>
                )}
                {ev.status === 'rejected' && (
                  <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/host')}
                    className="flex-1 py-2.5 bg-amber-bg border border-amber-border text-amber
                               rounded-xl text-[12px] font-bold transition-all
                               flex items-center justify-center gap-1.5 hover:bg-[#FEF3C7]">
                    <PenLine size={13} strokeWidth={2} />
                    Resubmit
                  </motion.button>
                )}
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={copyLink}
                  className="px-3.5 py-2.5 border border-border rounded-xl text-[12px] font-semibold
                             text-text-2 hover:border-primary hover:text-primary transition-all
                             flex items-center justify-center gap-1.5">
                  <Link2 size={13} strokeWidth={2} />
                  Copy Link
                </motion.button>
              </div>

              <div className="text-[10px] text-text-4 text-center pt-0.5">
                Submitted {new Date(ev.createdAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   TABS CONFIG
══════════════════════════════════════════════════ */
const TABS = [
  { id: 'overview', label: 'Overview',  Icon: LayoutDashboard },
  { id: 'events',   label: 'My Events', Icon: CalendarDays },
  { id: 'tips',     label: 'Tips',      Icon: Lightbulb },
];

/* ══════════════════════════════════════════════════
   OVERVIEW TAB
══════════════════════════════════════════════════ */
function OverviewTab({ events, user, navigate, onViewAll }) {
  const total    = events.length;
  const approved = events.filter(e => e.status === 'approved').length;
  const pending  = events.filter(e => e.status === 'pending').length;
  const totalRegs = events
    .filter(e => e.status === 'approved')
    .reduce((s, e) => s + (e.registrationCount || 0), 0);

  return (
    <div className="space-y-5">

      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#6D28D9] to-[#7C3AED] px-6 py-6 shadow-[0_4px_24px_rgba(79,70,229,0.25)]">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/08 pointer-events-none" />
        <div className="absolute top-3 right-3 opacity-20 pointer-events-none">
          <svg viewBox="0 0 60 60" fill="none" className="w-14 h-14">
            <circle cx="30" cy="30" r="26" stroke="white" strokeWidth="1.5" strokeDasharray="4 3"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              <span className="text-white text-[10px] font-bold tracking-widest uppercase">Organizer</span>
            </div>
          </div>
          <div className="font-display font-bold text-[22px] md:text-[24px] text-white leading-tight mb-1 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Organizer'}
          </div>
          <div className="text-white/70 text-[13px] mb-4">
            {user?.college || 'FestNest Organizer'}
          </div>

          <div className="flex items-center gap-4">
            {[
              { v: total,    l: 'Submitted' },
              { v: approved, l: 'Live' },
              { v: pending,  l: 'In Review' },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <div className="font-display font-bold text-[18px] text-white leading-none">{v}</div>
                <div className="text-[10px] text-white/60 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard Icon={CalendarDays} label="Total Submitted"  value={total}    color="indigo" />
        <StatCard Icon={CheckCircle2} label="Live Events"       value={approved} color="green" />
        <StatCard Icon={Clock}        label="Under Review"      value={pending}  color="amber" />
        <StatCard Icon={Users}        label="Registrations"
          value={totalRegs > 0 ? totalRegs : (approved > 0 ? '–' : 0)}
          color="purple"
          sub={approved > 0 ? `across ${approved} live event${approved !== 1 ? 's' : ''}` : undefined} />
      </div>

      {/* Recent submissions */}
      {events.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-4">
              Recent Submissions
            </div>
            <button onClick={onViewAll}
              className="text-[11px] font-semibold text-primary hover:underline">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {events.slice(0, 4).map((ev, i) => {
              const ts = TYPE_ICON_STYLE[ev.eventType] || TYPE_ICON_STYLE.Other;
              const TIcon = ts.Icon;
              return (
                <motion.div key={ev._id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 bg-white border border-border rounded-xl
                             hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ts.cls}`}>
                    {ev.bannerImage?.url
                      ? <img src={ev.bannerImage.url} alt="" className="w-full h-full rounded-xl object-cover" />
                      : <TIcon size={20} strokeWidth={1.8} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-text-1 truncate">{ev.eventName}</div>
                    <div className="text-[11px] text-text-3 truncate">{ev.college} · {ev.startDate}</div>
                  </div>
                  <StatusBadge status={ev.status} />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Points banner */}
      {user?.points > 0 && (
        <motion.div whileHover={{ y: -1 }}
          className="bg-gradient-to-r from-primary-light to-[#EDE9FE] border border-[#C7D2FE]
                     rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white border border-[#C7D2FE] shadow-sm
                          flex items-center justify-center flex-shrink-0">
            <Star size={22} strokeWidth={1.8} className="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[20px] text-primary leading-none">
              {user.points.toLocaleString('en-IN')} pts
            </div>
            <div className="text-[12px] text-primary/70 mt-0.5">FestNest points earned</div>
          </div>
          <div className="text-[11px] font-semibold text-primary bg-white rounded-xl px-3 py-2 border border-[#C7D2FE] text-center leading-tight flex-shrink-0">
            +300 per<br/>event
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-4 mb-3">Quick Actions</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              Icon: Plus,
              label: 'Post New Event',
              sub: 'Submit for review',
              to: '/host',
              cls: 'bg-primary text-white hover:bg-primary-dark hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)]',
              subCls: 'text-white/70',
            },
            {
              Icon: User,
              label: 'Edit Profile',
              sub: 'Update your info',
              to: '/profile',
              cls: 'bg-white border border-border text-text-1 hover:border-primary/40 hover:shadow-sm',
              subCls: 'text-text-3',
            },
          ].map(({ Icon: ActionIcon, label, sub, to, cls, subCls }) => (
            <motion.button key={label} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(to)}
              className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${cls}`}>
              <ActionIcon size={22} strokeWidth={1.8} />
              <div>
                <div className="font-semibold text-[13px] leading-tight">{label}</div>
                <div className={`text-[11px] mt-0.5 ${subCls}`}>{sub}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {total === 0 && (
        <Empty Icon={CalendarDays}
          title="No events yet"
          sub="Post your first event and reach 48,000+ students across India."
          action="Post Your First Event"
          onAction={() => navigate('/host')} />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MY EVENTS TAB
══════════════════════════════════════════════════ */
const FILTER_OPTS = [
  { key: 'all',      Icon: Filter,       label: 'All' },
  { key: 'approved', Icon: CheckCircle2, label: 'Live' },
  { key: 'pending',  Icon: Clock,        label: 'Review' },
  { key: 'rejected', Icon: XCircle,      label: 'Rejected' },
];

function MyEventsTab({ events, loading, navigate, showToast }) {
  const [filter,   setFilter]   = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [search,   setSearch]   = useState('');

  const counts = {
    all:      events.length,
    approved: events.filter(e => e.status === 'approved').length,
    pending:  events.filter(e => e.status === 'pending').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  };

  const filtered = events
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e => !search
      || e.eventName?.toLowerCase().includes(search.toLowerCase())
      || e.college?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">

      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search events by name or college…"
          className="w-full pl-10 pr-4 py-2.5 text-[13px] border border-border rounded-xl bg-white
                     focus:border-primary focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]
                     outline-none transition-all placeholder:text-text-4" />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full
                       bg-surface-3 flex items-center justify-center text-text-3 hover:text-text-1 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {FILTER_OPTS.map(({ key, Icon: FIcon, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold
                        border whitespace-nowrap flex-shrink-0 transition-all duration-150
                        ${filter === key
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white text-text-2 border-border hover:border-primary/40'}`}>
            <FIcon size={12} strokeWidth={1.8} />
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center
                              ${filter === key ? 'bg-white/25 text-white' : 'bg-surface-3 text-text-3'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Event list */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        filter === 'all' && !search ? (
          <Empty Icon={CalendarDays}
            title="No events yet"
            sub="Submit your first event and reach students across India."
            action="Post an Event"
            onAction={() => navigate('/host')} />
        ) : (
          <Empty Icon={Search} title="No events found"
            sub="Try a different filter or search term." />
        )
      ) : (
        <div className="space-y-3">
          {filtered.map((ev, i) => (
            <motion.div key={ev._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: i * 0.04 }}>
              <EventCard
                ev={ev}
                expanded={expanded === ev._id}
                onToggle={() => setExpanded(expanded === ev._id ? null : ev._id)}
                onView={(linkedId) => navigate(`/event/${linkedId}`)}
                navigate={navigate}
                showToast={showToast}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Post another CTA */}
      {!loading && events.length > 0 && (
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/host')}
          className="w-full py-3.5 border-2 border-dashed border-[#C7D2FE] rounded-2xl
                     text-[13px] font-semibold text-primary hover:bg-primary-light
                     hover:border-primary/40 transition-all flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Post Another Event
        </motion.button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   TIPS TAB
══════════════════════════════════════════════════ */
const TIPS_DATA = [
  {
    category: 'Visibility',
    items: [
      { Icon: Camera,        title: 'Upload a great poster',      body: 'Events with a high-quality banner get 3× more clicks. Use 1200×630 px for best results. Canva has free templates.' },
      { Icon: Target,        title: 'Choose the right category',  body: 'Selecting the correct category ensures your event surfaces in the right filters. "Hackathon" vs "Competition" reaches very different audiences.' },
      { Icon: Clock,         title: 'Submit early',               body: 'Events submitted 3+ weeks before the start date get featured in "Coming Soon" sections and deadline reminder notifications.' },
    ],
  },
  {
    category: 'Registrations',
    items: [
      { Icon: Trophy,        title: 'Add prize details',          body: 'Events with a prize pool attract 2× more registrations. Be specific — "₹50,000 for 1st place" outperforms "attractive prizes".' },
      { Icon: Link2,         title: 'Add a registration link',    body: 'Link directly to your Google Form, Unstop, or Devfolio page. Friction kills sign-ups — make it one tap away.' },
      { Icon: ClipboardList, title: 'Clear eligibility rules',    body: 'Specify year of study, branch, and team size upfront. Ambiguity frustrates students and reduces conversions.' },
    ],
  },
  {
    category: 'Trust & Reach',
    items: [
      { Icon: PenLine,  title: 'Write a compelling description', body: 'State what participants will do, learn, or win in the first two sentences — that\'s what students read first.' },
      { Icon: Phone,    title: 'Provide contact info',           body: 'Students have questions before registering. A phone number or POC email can be the difference between a sign-up and a bounce.' },
      { Icon: FileText, title: 'Attach a brochure',              body: 'A PDF brochure builds credibility and gives students something to share with teammates.' },
    ],
  },
];

function TipsTab({ navigate }) {
  return (
    <div className="space-y-6">

      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#6D28D9] to-[#7C3AED] px-6 py-5 shadow-[0_4px_20px_rgba(79,70,229,0.22)]">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/08 pointer-events-none" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
            <Lightbulb size={24} strokeWidth={1.8} className="text-white" />
          </div>
          <div className="font-display font-bold text-[18px] text-white mb-1">
            Make your event successful
          </div>
          <div className="text-white/70 text-[13px] leading-relaxed">
            Follow these tips to maximise registrations and reach more students across India.
          </div>
        </div>
      </div>

      {/* Tip sections */}
      {TIPS_DATA.map((section, si) => (
        <div key={section.category}>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-4">
              {section.category}
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2.5">
            {section.items.map((tip, i) => (
              <motion.div key={tip.title}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: si * 0.08 + i * 0.04 }}
                className="bg-white border border-border rounded-2xl p-4
                           shadow-[0_1px_4px_rgba(0,0,0,0.05)]
                           hover:border-primary/30 hover:shadow-[0_3px_12px_rgba(79,70,229,0.08)]
                           transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center
                                  flex-shrink-0 shadow-[0_0_0_4px_rgba(79,70,229,0.08)]">
                    <tip.Icon size={18} strokeWidth={1.8} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-[14px] text-text-1 mb-1">{tip.title}</div>
                    <div className="text-[13px] text-text-2 leading-relaxed">{tip.body}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {/* CTA */}
      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/host')}
        className="w-full py-3.5 bg-primary text-white rounded-xl text-[14px] font-bold
                   hover:bg-primary-dark hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all
                   flex items-center justify-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Post Your Event Now
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SIDEBAR (30%) — desktop only
══════════════════════════════════════════════════ */
function DashboardSidebar({ navigate, featuredEvents, featuredLoading }) {
  return (
    <div className="hidden lg:flex lg:flex-col lg:gap-6 lg:sticky lg:top-[108px]">
      <div>
        <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-text-3 mb-3 px-0.5">
          Featured on FestNest
        </div>
        {featuredLoading ? (
          <div className="space-y-3">
            {[0, 1].map(i => (
              <div key={i} className="bg-white border border-[#E4E4E0] rounded-[18px] overflow-hidden animate-pulse">
                <div className="h-[130px] bg-surface-3" />
                <div className="p-4 space-y-2">
                  <div className="h-2.5 w-16 bg-surface-3 rounded-full" />
                  <div className="h-4 w-3/4 bg-surface-3 rounded-full" />
                  <div className="h-3 w-1/2 bg-surface-3 rounded-full" />
                  <div className="h-9 bg-surface-3 rounded-[10px] mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="space-y-3">
            {featuredEvents.slice(0, 2).map(ev => (
              <FeaturedEventCard key={ev.id} event={ev} className="w-full" />
            ))}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-[18px] p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center mx-auto mb-2">
              <Star size={22} strokeWidth={1.8} className="text-primary" />
            </div>
            <div className="text-[12px] font-semibold text-text-2 mb-0.5">No featured events yet</div>
            <div className="text-[11px] text-text-3">Check back soon!</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════ */
export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, currentUser, requireAuth, showToast } = useApp();

  const isOrganizer  = currentUser?.role === 'organizer';
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const canAccess    = isOrganizer || isSuperAdmin;

  const [activeTab,       setActiveTab]       = useState('overview');
  const [events,          setEvents]          = useState([]);
  const [user,            setUser]            = useState(currentUser);
  const [loading,         setLoading]         = useState(true);
  const [featuredEvents,  setFeaturedEvents]  = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  /* Auth guard */
  useEffect(() => {
    if (!isLoggedIn) { requireAuth(); return; }
    if (!canAccess)  navigate('/');
  }, [isLoggedIn, canAccess]);

  /* Fetch dashboard data */
  const load = useCallback(async () => {
    if (!isLoggedIn || !canAccess) return;
    setLoading(true);
    try {
      const [meRes, hostedRes] = await Promise.all([
        usersApi.me(),
        usersApi.hosted(),
      ]);
      setUser(meRes.data.user);
      setEvents(hostedRes.data.hostedEvents || []);
    } catch (e) {
      showToast(e.message || 'Failed to load dashboard', 'error');
      if (currentUser) setUser(currentUser);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, canAccess]);

  useEffect(() => { load(); }, [load]);

  /* Fetch featured events for sidebar */
  useEffect(() => {
    eventsApi.featured()
      .then(r => setFeaturedEvents(normaliseEvents(r.data.events || [])))
      .catch(() => {})
      .finally(() => setFeaturedLoading(false));
  }, []);

  if (!isLoggedIn || !canAccess) return null;

  const initials = user?.avatar?.initials
    || user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    || '??';

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="bg-[#F8F8F6] min-h-screen w-full overflow-x-hidden">

      {/* ── Sticky header + tabs ── */}
      <div className="bg-white border-b border-border sticky top-0 z-10
                      shadow-[0_1px_6px_rgba(0,0,0,0.06)]">

        {/* Top bar */}
        <div className="px-4 py-3 md:px-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center
                       text-text-3 hover:bg-surface-3 hover:text-text-1 transition-all flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>

          {/* Avatar + role badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-light border-2 border-primary
                              flex items-center justify-center text-[11px] font-bold text-primary">
                {initials}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1 bg-primary-light border border-[#C7D2FE]
                            rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"/>
              <span className="text-[10px] font-bold text-primary tracking-wide">ORGANIZER</span>
            </div>
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] text-text-1 leading-none truncate">
              Organizer Hub
            </div>
            <div className="text-[11px] text-text-3 truncate mt-0.5">
              {user?.name || '…'} · {user?.college || 'FestNest'}
            </div>
          </div>

          {/* CTA */}
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/host')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl
                       text-[12px] font-bold hover:bg-primary-dark
                       hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all flex-shrink-0">
            <Plus size={13} strokeWidth={2.5} />
            Post Event
          </motion.button>
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-border px-4 md:px-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`relative flex items-center gap-1.5 py-2.5 px-4 text-[13px] font-semibold
                          border-b-2 transition-all duration-200
                          ${activeTab === t.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-3 hover:text-text-1 hover:border-border'}`}>
              <t.Icon size={14} strokeWidth={1.8} />
              {t.label}
              {t.id === 'events' && events.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center
                                  ${activeTab === t.id ? 'bg-primary-light text-primary' : 'bg-surface-3 text-text-3'}`}>
                  {events.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── 70 / 30 content grid ── */}
      <div className="px-4 pt-6 pb-24
                      md:px-6 md:pt-8
                      lg:max-w-[1100px] lg:mx-auto lg:px-8
                      lg:grid lg:grid-cols-[7fr_3fr] lg:gap-8 lg:items-start">

        {/* Left — main content (70%) */}
        <div className="max-w-[680px] mx-auto w-full lg:max-w-none lg:mx-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {activeTab === 'overview' && (
                <OverviewTab
                  events={events}
                  user={user}
                  navigate={navigate}
                  onViewAll={() => setActiveTab('events')}
                />
              )}
              {activeTab === 'events' && (
                <MyEventsTab
                  events={events}
                  loading={loading}
                  navigate={navigate}
                  showToast={showToast}
                />
              )}
              {activeTab === 'tips' && (
                <TipsTab navigate={navigate} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — sidebar (30%) */}
        <DashboardSidebar
          navigate={navigate}
          featuredEvents={featuredEvents}
          featuredLoading={featuredLoading}
        />
      </div>
    </motion.div>
  );
}
