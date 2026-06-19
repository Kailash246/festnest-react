import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, CalendarDays, Map, CheckCircle2, Crown, Lock, Trophy, Award,
  Bell, Bookmark, ClipboardList, PenLine, ShieldCheck, CircleHelp, LogOut,
  BarChart3, Building2, MapPin, Mail, GraduationCap, Code2, Music4, Wrench,
  Mic, Zap, PartyPopper, Users, LayoutDashboard, Globe, Link2, Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Seo from '../components/Seo';
import { users as usersApi, events as eventsApi } from '../services/api';
import { normaliseEvent, normaliseEvents } from '../services/normalise';

/* ══════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════ */
function isUpcoming(ev) {
  if (!ev?.startDate) return true;
  const d = new Date(ev.startDate);
  return isNaN(d.getTime()) ? true : d >= new Date();
}

const ACHIEVEMENT_DEFS = [
  { id: 'pioneer',  Icon: Star,         name: 'Pioneer',     desc: 'Joined FestNest',             tier: 'bronze', check: ()           => true },
  { id: 'first',    Icon: CalendarDays, name: 'First Timer', desc: 'Registered for first event',  tier: 'bronze', check: ({ reg })     => reg >= 1 },
  { id: 'explorer', Icon: Map,          name: 'Explorer',    desc: '5 events registered',         tier: 'silver', check: ({ reg })     => reg >= 5 },
  { id: 'finisher', Icon: CheckCircle2, name: 'Finisher',    desc: 'Completed an event',          tier: 'silver', check: ({ done })    => done >= 1 },
  { id: 'star',     Icon: Trophy,       name: 'Rising Star', desc: '500+ FestNest points',        tier: 'gold',   check: ({ pts })     => pts >= 500 },
  { id: 'pro',      Icon: Crown,        name: 'FestNest Pro',desc: '1000+ FestNest points',       tier: 'gold',   check: ({ pts })     => pts >= 1000 },
];

const TIER = {
  bronze: { ring: 'from-[#CD7F32] via-[#A0522D] to-[#8B4513]', inner: 'from-[#FEF3C7] to-[#FDE68A]', glow: '205,127,50',  iconCls: 'text-[#92400E]' },
  silver: { ring: 'from-[#C0C0C0] via-[#A8A8A8] to-[#808080]', inner: 'from-[#F8F8F6] to-[#E4E4E0]', glow: '192,192,192', iconCls: 'text-[#475569]' },
  gold:   { ring: 'from-[#FFD700] via-[#FFA500] to-[#FF8C00]', inner: 'from-[#FFFBEB] to-[#FEF08A]', glow: '255,200,0',   iconCls: 'text-[#92400E]' },
};

const STATUS_STYLE = {
  confirmed: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  pending:   'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  cancelled: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
};

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
   SKELETON SHIMMER
══════════════════════════════════════════════════ */
const Sk = ({ h = 'h-4', w = 'w-full', r = 'rounded-md' }) => (
  <div className={`skeleton ${h} ${w} ${r}`} />
);

/* ══════════════════════════════════════════════════
   ROLE BADGE
══════════════════════════════════════════════════ */
function RoleBadge({ role, large }) {
  const base = large ? 'text-[12px] px-3.5 py-1.5 gap-2' : 'text-[11px] px-2.5 py-1 gap-1.5';
  if (role === 'organizer')
    return (
      <span className={`inline-flex items-center font-bold rounded-md border ${base}
                        bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" /> Organizer
      </span>
    );
  if (role === 'admin' || role === 'superadmin')
    return (
      <span className={`inline-flex items-center font-bold rounded-md border ${base}
                        bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" /> Admin
      </span>
    );
  return (
    <span className={`inline-flex items-center font-bold rounded-md border ${base}
                      bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> Student
    </span>
  );
}

/* ══════════════════════════════════════════════════
   INFO CHIP
══════════════════════════════════════════════════ */
const InfoChip = ({ Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 bg-surface-2 border border-border
                   text-[12px] text-text-2 px-2.5 py-1 rounded-md">
    <Icon size={12} strokeWidth={1.8} className="text-text-3 flex-shrink-0" />
    {children}
  </span>
);

/* ══════════════════════════════════════════════════
   HERO SECTION
══════════════════════════════════════════════════ */
function HeroSection({ user, role, loading, onEdit }) {
  const isOrg = role === 'organizer';
  const gradient = isOrg
    ? 'from-[#4F46E5] via-[#6D28D9] to-[#9333EA]'
    : 'from-[#059669] via-[#0891B2] to-[#4F46E5]';

  const initials = user?.avatar?.initials
    || user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    || '??';

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      <div className={`relative h-[160px] bg-gradient-to-br ${gradient} overflow-hidden`}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 left-8 w-28 h-28 rounded-full bg-white/08" />
        <div className="absolute top-4 right-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30
                       backdrop-blur-sm text-white text-[11px] font-semibold
                       px-3 py-1.5 rounded-lg border border-white/25 transition-all">
            <PenLine size={11} strokeWidth={2} />
            Edit Profile
          </motion.button>
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="flex items-end justify-between -mt-[44px] mb-4">
          <div className="relative flex-shrink-0">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name}
                className="w-[88px] h-[88px] rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-[88px] h-[88px] rounded-md border-4 border-white shadow-lg
                              flex items-center justify-center font-display font-bold text-[26px]
                              text-primary bg-primary-light">
                {loading ? '' : initials}
              </div>
            )}
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-[#22C55E] rounded-full
                            border-2 border-white shadow-sm" />
          </div>
          {(user?.points || 0) > 0 && !loading && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-primary-light to-[#EDE9FE]
                         border border-[#C7D2FE] text-primary text-[12px] font-bold
                         px-3 py-1.5 rounded-md shadow-sm mb-0.5">
              <Star size={12} strokeWidth={2} className="text-amber-500" />
              {user.points.toLocaleString('en-IN')} pts
            </motion.div>
          )}
        </div>

        {loading ? (
          <div className="space-y-2 mb-4">
            <Sk h="h-8" w="w-48" r="rounded-lg" />
            <Sk h="h-5" w="w-32" r="rounded-full" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            <h1 className="font-display font-bold text-[26px] md:text-[30px] text-text-1
                           tracking-tight leading-none mb-2">
              {user?.name || 'User'}
            </h1>
            <div className="mb-3">
              <RoleBadge role={role} large />
            </div>
          </motion.div>
        )}

        {!loading && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="flex flex-wrap gap-2">
            {isOrg ? (
              (user?.organization || user?.college) && (
                <InfoChip Icon={Building2}>
                  {user.organization || user.college}{user.branch ? ` · ${user.branch}` : ''}
                </InfoChip>
              )
            ) : (
              user?.college && (
                <InfoChip Icon={GraduationCap}>
                  {user.college}{user.branch ? ` · ${user.branch}` : ''}
                </InfoChip>
              )
            )}
            {isOrg && user?.designation && (
              <InfoChip Icon={Briefcase}>{user.designation}</InfoChip>
            )}
            {role !== 'organizer' && user?.year && (
              <InfoChip Icon={CalendarDays}>{user.year} Year</InfoChip>
            )}
            {user?.city && <InfoChip Icon={MapPin}>{user.city}</InfoChip>}
            {user?.email && <InfoChip Icon={Mail}>{user.email}</InfoChip>}
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   STUDENT STATS
══════════════════════════════════════════════════ */
const STAT_CONFIGS = [
  { key: 'registered', Icon: CalendarDays, label: 'Registered',  grad: 'from-[#EEF2FF] to-[#E0E7FF]', ic: 'bg-primary-light text-primary' },
  { key: 'attended',   Icon: CheckCircle2, label: 'Attended',    grad: 'from-[#F0FDF4] to-[#DCFCE7]', ic: 'bg-[#F0FDF4] text-[#16A34A]' },
  { key: 'certs',      Icon: Award,        label: 'Certificates', grad: 'from-[#FFFBEB] to-[#FEF3C7]', ic: 'bg-[#FFFBEB] text-[#B45309]' },
  { key: 'achieve',    Icon: Trophy,       label: 'Achievements', grad: 'from-[#FAF5FF] to-[#F3E8FF]', ic: 'bg-[#F5F3FF] text-[#7C3AED]' },
];

function StudentStats({ stats, completedCount, unlockedCount, loading }) {
  const values = {
    registered: stats.registered ?? '—',
    attended:   completedCount > 0 ? completedCount : '—',
    certs:      '—',
    achieve:    unlockedCount || '—',
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STAT_CONFIGS.map(({ key, Icon, label, grad, ic }, i) => (
        <motion.div key={key}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.10)' }}
          className={`relative bg-gradient-to-br ${grad} border border-border rounded-lg p-3
                      text-center shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden cursor-default`}>
          <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full bg-white/40 pointer-events-none" />
          {loading ? (
            <div className="space-y-2">
              <Sk h="h-6" w="w-8" r="rounded-md mx-auto" />
              <Sk h="h-3" w="w-full" r="rounded" />
            </div>
          ) : (
            <>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${ic}`}>
                <Icon size={16} strokeWidth={1.8} />
              </div>
              <div className="font-display font-bold text-[22px] text-text-1 leading-none mb-0.5">
                {values[key]}
              </div>
              <div className="text-[10px] text-text-3 font-semibold uppercase tracking-wide leading-tight">
                {label}
              </div>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ACHIEVEMENT BADGE
══════════════════════════════════════════════════ */
function AchievementBadge({ ach, unlocked, index }) {
  const t = TIER[ach.tier];
  const AchIcon = ach.Icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 280, damping: 18 }}
      whileHover={unlocked ? { y: -4, scale: 1.06 } : {}}
      className="flex flex-col items-center gap-2 cursor-default select-none">

      <div className={`relative ${!unlocked ? 'opacity-35 grayscale' : ''}`}>
        {unlocked && (
          <div className="absolute inset-0 rounded-full blur-xl opacity-40 scale-110"
            style={{ background: `radial-gradient(circle, rgba(${t.glow},0.8), transparent 70%)` }} />
        )}
        <div className={`relative w-[68px] h-[68px] rounded-md bg-gradient-to-br ${t.ring} p-[3px] shadow-lg`}>
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${t.inner}
                           flex items-center justify-center`}>
            {unlocked
              ? <AchIcon size={26} strokeWidth={1.8} className={t.iconCls} />
              : <Lock size={20} strokeWidth={2} className="text-text-4" />
            }
          </div>
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white
                         bg-gradient-to-br ${t.ring} flex items-center justify-center`}>
          <span className="text-[6px] font-black text-white">
            {ach.tier === 'gold' ? 'G' : ach.tier === 'silver' ? 'S' : 'B'}
          </span>
        </div>
      </div>

      <div className="text-center max-w-[72px]">
        <div className={`text-[11px] font-bold leading-tight ${unlocked ? 'text-text-1' : 'text-text-4'}`}>
          {ach.name}
        </div>
        <div className="text-[9px] text-text-4 mt-0.5 leading-tight">{ach.desc}</div>
      </div>
    </motion.div>
  );
}

function AchievementsSection({ stats, completedCount, loading }) {
  const s = { pts: stats.points || 0, reg: stats.registered || 0, done: completedCount };
  const achievements = ACHIEVEMENT_DEFS.map(d => ({ ...d, unlocked: d.check(s) }));
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <div className="font-display font-bold text-[15px] text-text-1">Achievements</div>
          <div className="text-[11px] text-text-3 mt-0.5">
            {unlockedCount}/{achievements.length} unlocked
          </div>
        </div>
        <div className="w-24">
          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-[#7C3AED] rounded-md"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }} />
          </div>
          <div className="text-[10px] text-text-4 mt-1 text-right">
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        {loading ? (
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="skeleton w-[68px] h-[68px] rounded-full" />
                <Sk h="h-3" w="w-14" r="rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {achievements.map((ach, i) => (
              <AchievementBadge key={ach.id} ach={ach} unlocked={ach.unlocked} index={i} />
            ))}
          </div>
        )}
        {!loading && unlockedCount < achievements.length && (
          <div className="mt-4 pt-4 border-t border-border text-center">
            <div className="text-[12px] text-text-3">
              {achievements.length - unlockedCount} achievement{achievements.length - unlockedCount !== 1 ? 's' : ''} left —{' '}
              <span className="text-primary font-semibold">keep participating!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CERTIFICATES SECTION
══════════════════════════════════════════════════ */
function CertificatesSection() {
  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="px-5 py-4 border-b border-border">
        <div className="font-display font-bold text-[15px] text-text-1">Certificates</div>
        <div className="text-[11px] text-text-3 mt-0.5">Earned from events you've attended</div>
      </div>
      <div className="p-5">
        <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-[#C7D2FE]
                        bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] p-5 mb-4 opacity-60">
          <div className="absolute top-3 right-3 text-[8px] font-bold text-primary bg-white
                          px-2 py-0.5 rounded-md border border-[#C7D2FE]">PREVIEW</div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light border border-[#C7D2FE]
                            flex items-center justify-center">
              <Award size={20} strokeWidth={1.8} className="text-primary" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-text-1">Certificate of Participation</div>
              <div className="text-[11px] text-text-3">TechFest 2025 · IIT Bombay</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-text-4">Issued Jan 2025</div>
            <div className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-md opacity-50">
              View Certificate
            </div>
          </div>
        </div>

        <div className="text-center py-3">
          <div className="w-12 h-12 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg flex items-center
                          justify-center mx-auto mb-3">
            <Award size={24} strokeWidth={1.8} className="text-[#B45309]" />
          </div>
          <div className="font-semibold text-[14px] text-text-1 mb-1.5">No certificates yet</div>
          <div className="text-[12px] text-text-3 leading-relaxed max-w-[260px] mx-auto mb-4">
            Attend events to earn participation certificates and competition awards.
          </div>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 bg-primary text-white rounded-lg text-[12px] font-bold
                       hover:bg-primary-dark hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all"
            onClick={() => window.location.href = '/'}>
            Discover Events
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   EVENT MINI CARD
══════════════════════════════════════════════════ */
function EventMiniCard({ ev, status, onClick }) {
  return (
    <motion.div whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.98 }} onClick={onClick}
      className="bg-white border border-border rounded-lg overflow-hidden cursor-pointer
                 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all flex-shrink-0 w-[180px]">
      <div className={`h-[90px] flex items-center justify-center relative overflow-hidden ${ev.bg || 'bg1'}`}>
        {ev.imageUrl
          ? <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover" />
          : <span className="text-[38px] select-none">{ev.emoji || ''}</span>
        }
        {status && (
          <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5
                            rounded-md border ${STATUS_STYLE[status] || STATUS_STYLE.pending}`}>
            {status}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-[12px] font-bold text-text-1 leading-tight line-clamp-2 mb-1">
          {ev.name}
        </div>
        <div className="text-[10px] text-text-3 truncate">{ev.college}</div>
        <div className="text-[10px] text-text-4 mt-1.5 flex items-center gap-1">
          <CalendarDays size={9} strokeWidth={2} className="flex-shrink-0" />
          {ev.startDate}
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   MY EVENTS SECTION (Student)
══════════════════════════════════════════════════ */
const EVENT_TABS = [
  { id: 'upcoming',  label: 'Upcoming'  },
  { id: 'completed', label: 'Completed' },
  { id: 'saved',     label: 'Saved'     },
];

function MyEventsSection({ registrations, savedEvList, savedLoading, savedCount, loading, navigate, onTabChange }) {
  const [tab, setTab] = useState('upcoming');
  const upcoming  = registrations.filter(r => isUpcoming(r.ev));
  const completed = registrations.filter(r => !isUpcoming(r.ev));
  const counts = { upcoming: upcoming.length, completed: completed.length, saved: savedCount || 0 };
  const currentList = tab === 'upcoming' ? upcoming : tab === 'completed' ? completed : null;

  const handleTab = (id) => {
    setTab(id);
    onTabChange?.(id);
  };

  const EmptyState = ({ Icon: EIcon, title, sub, action, onAction }) => (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="w-12 h-12 bg-surface-2 border border-border rounded-lg flex items-center
                      justify-center mx-auto mb-3">
        <EIcon size={22} strokeWidth={1.8} className="text-text-3" />
      </div>
      <div className="font-semibold text-[14px] text-text-1 mb-1">{title}</div>
      <div className="text-[12px] text-text-3 mb-4 max-w-[220px] leading-relaxed">{sub}</div>
      {action && (
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="px-5 py-2 bg-primary text-white rounded-lg text-[12px] font-bold
                     hover:bg-primary-dark transition-all">
          {action}
        </motion.button>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="px-5 pt-4 pb-0">
        <div className="font-display font-bold text-[15px] text-text-1 mb-3">My Events</div>
        <div className="flex gap-0 border-b border-border -mx-5 px-5">
          {EVENT_TABS.map(t => (
            <button key={t.id} onClick={() => handleTab(t.id)}
              className={`flex items-center gap-1.5 pb-2.5 px-1 mr-5 text-[13px] font-semibold
                          border-b-2 transition-all duration-200
                          ${tab === t.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-3 hover:text-text-1'}`}>
              {t.label}
              {counts[t.id] > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold min-w-[18px] text-center
                                  ${tab === t.id ? 'bg-primary-light text-primary' : 'bg-surface-3 text-text-3'}`}>
                  {counts[t.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {(tab === 'upcoming' || tab === 'completed') && (
            loading ? (
              <div className="p-5">
                <div className="flex gap-3 overflow-hidden">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-[180px] flex-shrink-0 rounded-lg overflow-hidden border border-border">
                      <div className="skeleton h-[90px]" />
                      <div className="p-3 space-y-2"><Sk h="h-3.5" w="w-4/5" /><Sk h="h-3" w="w-3/5" /></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentList.length === 0 ? (
              <EmptyState
                Icon={tab === 'upcoming' ? CalendarDays : CheckCircle2}
                title={tab === 'upcoming' ? 'No upcoming events' : 'No completed events'}
                sub={tab === 'upcoming' ? 'Register for events to see them here' : 'Events you attend will appear here'}
                action={tab === 'upcoming' ? 'Browse Events' : undefined}
                onAction={() => navigate('/')}
              />
            ) : (
              <div className="p-5">
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {currentList.map(({ ev, status }) => (
                    <EventMiniCard key={ev.id} ev={ev} status={status}
                      onClick={() => navigate(`/event/${ev.id}`)} />
                  ))}
                </div>
              </div>
            )
          )}

          {tab === 'saved' && (
            savedLoading ? (
              <div className="p-5">
                <div className="flex gap-3 overflow-hidden">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-[180px] flex-shrink-0 rounded-lg overflow-hidden border border-border">
                      <div className="skeleton h-[90px]" />
                      <div className="p-3 space-y-2"><Sk h="h-3.5" w="w-4/5" /><Sk h="h-3" w="w-3/5" /></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : savedEvList.length === 0 ? (
              <EmptyState
                Icon={Bookmark} title="No saved events"
                sub="Bookmark events to revisit them later"
                action="Explore Events" onAction={() => navigate('/explore')}
              />
            ) : (
              <div className="p-5">
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {savedEvList.map(ev => (
                    <EventMiniCard key={ev.id} ev={ev}
                      onClick={() => navigate(`/event/${ev.id}`)} />
                  ))}
                </div>
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ORGANIZER: DASHBOARD CTA
══════════════════════════════════════════════════ */
function OrganizerCTA({ navigate }) {
  return (
    <motion.button whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(79,70,229,0.35)' }}
      whileTap={{ scale: 0.98 }} onClick={() => navigate('/organizer')}
      className="w-full relative overflow-hidden rounded-lg
                 bg-gradient-to-r from-[#4F46E5] via-[#6D28D9] to-[#7C3AED]
                 p-5 text-left shadow-[0_4px_20px_rgba(79,70,229,0.28)] transition-all">
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-6 right-20 w-20 h-20 rounded-full bg-white/06 pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <BarChart3 size={16} strokeWidth={1.8} className="text-white" />
            </div>
            <span className="text-white/70 text-[11px] font-bold tracking-widest uppercase">
              Organizer Hub
            </span>
          </div>
          <div className="font-display font-bold text-[20px] text-white mb-1">
            Organizer Dashboard
          </div>
          <div className="text-white/70 text-[13px]">
            Manage events, track submissions, view analytics
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 ml-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </div>
      </div>
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════
   ORGANIZER: ABOUT SECTION
══════════════════════════════════════════════════ */
function AboutOrgSection({ user, events = [] }) {
  // All values come straight from the database-backed user object.
  const orgName     = user?.organization || user?.college || '';
  const liveEvents  = events.filter(e => e.status === 'approved');
  const totalRegs   = liveEvents.reduce((s, e) => s + (e.registrationCount || 0), 0);

  const STATS = [
    { label: 'Events Hosted',  value: events.length },
    { label: 'Registrations',  value: totalRegs },
    { label: 'Active Events',  value: liveEvents.length },
  ];

  const NotProvided = () => <span className="text-text-4 italic font-normal">Not provided</span>;

  // Normalise a social/web handle into a clickable href
  const toHref = (v) => (/^https?:\/\//i.test(v) ? v : `https://${v}`);

  const LinkRow = ({ Icon, label, value, href }) => (
    <div className="flex items-center gap-2.5 p-3 bg-surface-2 rounded-lg border border-border">
      <div className="w-7 h-7 rounded-md bg-primary-light flex items-center justify-center flex-shrink-0">
        <Icon size={13} strokeWidth={1.8} className="text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-text-4 font-semibold uppercase tracking-wide">{label}</div>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer"
            className="text-[13px] text-primary font-medium hover:underline truncate block">{value}</a>
        ) : (
          <div className="text-[13px] text-text-1 font-medium truncate">{value}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-border rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="px-5 py-4 border-b border-border">
        <div className="font-display font-bold text-[15px] text-text-1">About Organization</div>
      </div>
      <div className="p-5">
        {/* Identity */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE]
                          flex items-center justify-center flex-shrink-0">
            <Building2 size={22} strokeWidth={1.8} className="text-[#7C3AED]" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-[16px] text-text-1 truncate">
              {orgName || <NotProvided />}
            </div>
            <div className="flex items-center gap-2 text-[12px] text-text-3 mt-0.5 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Briefcase size={11} strokeWidth={2} />
                {user?.designation || <NotProvided />}
              </span>
              {user?.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={11} strokeWidth={2} />{user.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {STATS.map(s => (
            <div key={s.label}
              className="bg-surface-2 border border-border rounded-lg p-3 text-center">
              <div className="font-display font-bold text-[20px] text-text-1 leading-none mb-1">
                {s.value}
              </div>
              <div className="text-[10px] text-text-3 font-semibold uppercase tracking-wide leading-tight">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bio (only if available) */}
        {user?.bio && (
          <p className="text-[13px] text-text-2 leading-relaxed mb-4">{user.bio}</p>
        )}

        {/* Contact & links */}
        <div className="space-y-2">
          <LinkRow Icon={Mail} label="Contact"
            value={user?.email || 'Not provided'} />
          {user?.website && (
            <LinkRow Icon={Globe} label="Website" value={user.website} href={toHref(user.website)} />
          )}
          {user?.linkedin && (
            <LinkRow Icon={Link2} label="LinkedIn" value={user.linkedin} href={toHref(user.linkedin)} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ORGANIZER: HOSTED EVENTS CARDS
══════════════════════════════════════════════════ */
const EV_STATUS = {
  pending:  { cls: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',  label: 'Under Review' },
  approved: { cls: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',  label: 'Live' },
  rejected: { cls: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',  label: 'Rejected' },
};

function HostedEventCard({ ev, navigate }) {
  const typeStyle = TYPE_ICON_STYLE[ev.eventType] || TYPE_ICON_STYLE.Other;
  const TypeIcon  = typeStyle.Icon;
  const status    = EV_STATUS[ev.status] || EV_STATUS.pending;

  return (
    <motion.div whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => ev.status === 'approved' && ev.linkedEvent && navigate(`/event/${ev.linkedEvent}`)}
      className={`bg-white border border-border rounded-lg overflow-hidden
                  shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all flex-shrink-0 w-[200px]
                  ${ev.status === 'approved' && ev.linkedEvent ? 'cursor-pointer' : 'cursor-default'}`}>
      <div className={`h-[100px] flex items-center justify-center relative ${typeStyle.cls}`}>
        {ev.bannerImage?.url
          ? <img src={ev.bannerImage.url} alt={ev.eventName} className="w-full h-full object-cover" />
          : <TypeIcon size={36} strokeWidth={1.8} />
        }
        <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-md border ${status.cls}`}>
          {status.label}
        </span>
      </div>
      <div className="p-3">
        <div className="text-[12px] font-bold text-text-1 line-clamp-2 leading-tight mb-1">
          {ev.eventName}
        </div>
        <div className="text-[10px] text-text-3 truncate">{ev.college}</div>
        <div className="text-[10px] text-text-4 mt-1.5 flex items-center gap-1">
          <CalendarDays size={9} strokeWidth={2} /> {ev.startDate}
        </div>
      </div>
    </motion.div>
  );
}

function HostedEventsSection({ events, loading, navigate }) {
  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <div className="font-display font-bold text-[15px] text-text-1">Hosted Events</div>
          <div className="text-[11px] text-text-3 mt-0.5">Events you've submitted to FestNest</div>
        </div>
        <motion.button whileHover={{ x: 2 }} onClick={() => navigate('/organizer')}
          className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1">
          View all
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </motion.button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex gap-3">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-[200px] flex-shrink-0 rounded-lg overflow-hidden border border-border">
                <div className="skeleton h-[100px]" />
                <div className="p-3 space-y-2"><Sk h="h-3.5" w="w-4/5" /><Sk h="h-3" w="w-3/5" /></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-12 h-12 bg-surface-2 border border-border rounded-lg flex items-center
                            justify-center mx-auto mb-3">
              <CalendarDays size={22} strokeWidth={1.8} className="text-text-3" />
            </div>
            <div className="font-semibold text-[14px] text-text-1 mb-1.5">No events hosted yet</div>
            <div className="text-[12px] text-text-3 mb-4 max-w-[220px] leading-relaxed">
              Post your first event to reach 48,000+ students across India.
            </div>
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/host')}
              className="px-5 py-2.5 bg-primary text-white rounded-lg text-[12px] font-bold
                         hover:bg-primary-dark hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all">
              Post an Event
            </motion.button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {events.slice(0, 8).map(ev => (
              <HostedEventCard key={ev._id} ev={ev} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ACTIVITY CENTER
══════════════════════════════════════════════════ */
function ActivityCard({ Icon: IconCmp, iconBg, title, desc, onClick }) {
  return (
    <motion.button whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
      whileTap={{ scale: 0.97 }} onClick={onClick}
      className="relative flex flex-col items-start gap-2 p-4 rounded-lg border
                 text-left transition-all bg-white overflow-hidden w-full
                 shadow-[0_1px_4px_rgba(0,0,0,0.05)] border-border hover:border-primary/25">
      <div className="absolute top-3 right-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-text-4">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <IconCmp size={16} strokeWidth={1.8} />
      </div>
      <div className="pr-4">
        <div className="text-[13px] font-bold leading-snug text-text-1">{title}</div>
        <div className="text-[11px] text-text-3 mt-0.5 leading-snug">{desc}</div>
      </div>
    </motion.button>
  );
}

function ActivityCenter({ isOrg, savedCount, navigate, showToast, onLogout }) {
  const studentItems = [
    { Icon: Bell,          iconBg: 'bg-[#EEF2FF] text-primary',       title: 'Notifications',      desc: 'Deadlines & announcements',     onClick: () => navigate('/notifications') },
    { Icon: Bookmark,      iconBg: 'bg-[#F0FDF4] text-[#16A34A]',     title: 'Saved Events',       desc: `${savedCount} bookmarked`,      onClick: () => navigate('/saved') },
    { Icon: ClipboardList, iconBg: 'bg-[#FFFBEB] text-[#B45309]',     title: 'My Registrations',   desc: 'All your event sign-ups',       onClick: () => navigate('/profile') },
    { Icon: PenLine,       iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',     title: 'Edit Profile',       desc: 'Name, photo, and details',      onClick: () => navigate('/profile/edit') },
    { Icon: ShieldCheck,   iconBg: 'bg-surface-2 text-text-2',         title: 'Privacy & Security', desc: 'Password and account settings', onClick: () => showToast('Coming soon', 'info') },
    { Icon: CircleHelp,    iconBg: 'bg-[#FEF2F2] text-[#DC2626]',     title: 'Help & Support',     desc: 'FAQs and contact support',      onClick: () => navigate('/support') },
  ];

  const orgItems = [
    { Icon: Bell,            iconBg: 'bg-[#EEF2FF] text-primary',       title: 'Notifications',      desc: 'Updates & announcements',       onClick: () => navigate('/notifications') },
    { Icon: LayoutDashboard, iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',    title: 'My Events',          desc: 'Manage your hosted events',     onClick: () => navigate('/organizer') },
    { Icon: PenLine,         iconBg: 'bg-[#FFFBEB] text-[#B45309]',    title: 'Edit Profile',       desc: 'Name, photo, and org info',     onClick: () => navigate('/profile/edit') },
    { Icon: ShieldCheck,     iconBg: 'bg-surface-2 text-text-2',        title: 'Privacy & Security', desc: 'Password and account settings', onClick: () => showToast('Coming soon', 'info') },
    { Icon: CircleHelp,      iconBg: 'bg-[#FEF2F2] text-[#DC2626]',    title: 'Help & Support',     desc: 'FAQs and contact support',      onClick: () => navigate('/support') },
  ];

  const items = isOrg ? orgItems : studentItems;

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="px-5 py-4 border-b border-border">
        <div className="font-display font-bold text-[15px] text-text-1">Activity Center</div>
        <div className="text-[11px] text-text-3 mt-0.5">Manage your account and preferences</div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {items.map((item, i) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <ActivityCard {...item} />
            </motion.div>
          ))}
        </div>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-3 p-4 rounded-md border border-[#FECACA]
                     bg-white hover:bg-[#FEF2F2] transition-all text-left
                     shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
            <LogOut size={16} strokeWidth={1.8} className="text-[#DC2626]" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-[#DC2626]">Sign Out</div>
            <div className="text-[11px] text-text-3">You'll be signed out of this device</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#DC2626]/50">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function Profile() {
  const navigate = useNavigate();
  const { savedCount, showToast, requireAuth, isLoggedIn, currentUser, logout } = useApp();

  const [profile,       setProfile]       = useState(null);
  const [stats,         setStats]         = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [hostedEvents,  setHostedEvents]  = useState([]);
  const [savedEvList,   setSavedEvList]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [savedLoading,  setSavedLoading]  = useState(false);
  const [savedFetched,  setSavedFetched]  = useState(false);

  const role  = profile?.role || currentUser?.role || 'user';
  const isOrg = role === 'organizer';

  useEffect(() => {
    if (!isLoggedIn) { requireAuth(); return; }
    load();
  }, [isLoggedIn]);

  const handleTabChange = (id) => {
    if (id !== 'saved' || savedFetched || isOrg) return;
    setSavedLoading(true);
    setSavedFetched(true);
    eventsApi.saved()
      .then(r => setSavedEvList(normaliseEvents(r.data.events || [])))
      .catch(() => {})
      .finally(() => setSavedLoading(false));
  };

  const load = async () => {
    setLoading(true);
    const userRole = currentUser?.role || 'user';
    try {
      const [meRes, secondRes] = await Promise.all([
        usersApi.me(),
        userRole === 'organizer' ? usersApi.hosted() : usersApi.registrations(),
      ]);
      const u = meRes.data.user;
      setProfile(u);
      setStats(meRes.data.stats || {});
      if (u.role === 'organizer') {
        setHostedEvents(secondRes.data.hostedEvents || []);
      } else {
        const regs = (secondRes.data.registrations || [])
          .map(r => ({ ev: normaliseEvent(r.event), status: r.status }))
          .filter(r => r.ev);
        setRegistrations(regs);
      }
    } catch {
      if (currentUser) setProfile(currentUser);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    navigate('/');
    await logout();
    showToast('Signed out. See you again!', 'info');
  };

  const displayUser   = profile || currentUser;
  const completed     = registrations.filter(r => !isUpcoming(r.ev));
  const unlockedCount = ACHIEVEMENT_DEFS.filter(d =>
    d.check({ pts: displayUser?.points || 0, reg: stats.registered || registrations.length, done: completed.length })
  ).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="bg-[#F5F5F9] min-h-screen w-full overflow-x-hidden">

      <Seo title="Your Profile" canonical="/profile" noindex />

      <div className="max-w-[720px] mx-auto px-4 pt-6 pb-28 md:px-6 space-y-5">

        <HeroSection
          user={displayUser} role={role} loading={loading}
          onEdit={() => navigate('/profile/edit')}
        />

        {!isOrg && (
          <>
            <StudentStats
              stats={stats}
              completedCount={completed.length}
              unlockedCount={unlockedCount}
              loading={loading}
            />
            <AchievementsSection
              stats={{ points: displayUser?.points || 0, registered: stats.registered || registrations.length }}
              completedCount={completed.length}
              loading={loading}
            />
            <MyEventsSection
              registrations={registrations}
              savedEvList={savedEvList}
              savedLoading={savedLoading}
              savedCount={savedCount}
              loading={loading}
              navigate={navigate}
              onTabChange={handleTabChange}
            />
            <CertificatesSection />
          </>
        )}

        {isOrg && (
          <>
            <OrganizerCTA navigate={navigate} />
            <AboutOrgSection user={displayUser} events={hostedEvents} />
            <HostedEventsSection events={hostedEvents} loading={loading} navigate={navigate} />
          </>
        )}

        <ActivityCenter
          isOrg={isOrg}
          savedCount={savedCount}
          navigate={navigate}
          showToast={showToast}
          onLogout={handleLogout}
        />
      </div>
    </motion.div>
  );
}
