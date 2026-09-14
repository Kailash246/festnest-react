// src/pages/organizer/tabs/OverviewTab.jsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  Trophy,
  Plus,
  ArrowRight,
  ExternalLink,
  Layers,
  Copy,
  PenSquare,
  Sparkles,
  BarChart2,
  TrendingUp,
  FileSpreadsheet,
  Award,
  List,
  User,
  Tag,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { SHOW_ENGAGEMENT_ANALYTICS } from '../config';
import useLongWait from '../../../hooks/useLongWait';
import LongWaitNotice from '../../../components/loading/LongWaitNotice';
import ProgressiveSection from '../../../components/loading/ProgressiveSection';

const STATUS_MAP = {
  pending: {
    label: 'Under Review',
    bgCls: 'bg-amber-50 text-amber-700 border-amber-200',
    dotCls: 'bg-amber-500',
  },
  approved: {
    label: 'Live',
    bgCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotCls: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    bgCls: 'bg-rose-50 text-rose-700 border-rose-200',
    dotCls: 'bg-rose-500',
  },
};

/**
 * Lightweight 3D Calendar illustration matching the reference UI style.
 */
function Calendar3DIllustration({ className = "w-28 h-28 sm:w-36 sm:h-36" }) {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      {/* Soft radiant aura */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-95" />

      {/* Sunbeam accents */}
      <div className="absolute top-2 right-2 w-1.5 h-4 bg-amber-300 rounded-full rotate-45" />
      <div className="absolute top-6 -right-1 w-4 h-1.5 bg-amber-300 rounded-full" />
      <div className="absolute -top-1 right-7 w-3.5 h-1.5 bg-amber-300 rounded-full rotate-12" />

      {/* 3D Isometric Calendar SVG */}
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(79,70,229,0.22)]"
      >
        {/* Calendar Back Page depth */}
        <rect x="38" y="32" width="94" height="98" rx="18" fill="#4338CA" />
        <rect x="42" y="30" width="88" height="96" rx="16" fill="#4F46E5" />

        {/* Calendar Front Main Sheet */}
        <rect x="28" y="36" width="96" height="98" rx="16" fill="url(#calendarBodyGrad)" />

        {/* Top Rings/Binders */}
        <rect x="46" y="24" width="8" height="20" rx="4" fill="#312E81" />
        <rect x="74" y="24" width="8" height="20" rx="4" fill="#312E81" />
        <rect x="102" y="24" width="8" height="20" rx="4" fill="#312E81" />

        {/* Calendar Header Band */}
        <path
          d="M28 52C28 43.1634 35.1634 36 44 36H108C116.837 36 124 43.1634 124 52V58H28V52Z"
          fill="url(#calendarHeaderGrad)"
        />

        {/* Calendar Grid Cells */}
        <rect x="40" y="68" width="14" height="12" rx="3" fill="#EEF2FF" />
        <rect x="62" y="68" width="14" height="12" rx="3" fill="#EEF2FF" />
        <rect x="84" y="68" width="14" height="12" rx="3" fill="#EEF2FF" />
        <rect x="104" y="68" width="10" height="12" rx="3" fill="#EEF2FF" />

        <rect x="40" y="86" width="14" height="12" rx="3" fill="#EEF2FF" />
        <rect x="62" y="86" width="14" height="12" rx="3" fill="#EEF2FF" />
        <rect x="84" y="86" width="14" height="12" rx="3" fill="#EEF2FF" />
        <rect x="104" y="86" width="10" height="12" rx="3" fill="#EEF2FF" />

        <rect x="40" y="104" width="14" height="12" rx="3" fill="#EEF2FF" />
        <rect x="62" y="104" width="14" height="12" rx="3" fill="#EEF2FF" />

        {/* 3D Star Badge Overlaid */}
        <g filter="url(#starShadow)">
          <path
            d="M98 90.5L102.3 99.2L111.9 100.6L105 107.3L106.6 116.9L98 112.4L89.4 116.9L91 107.3L84.1 100.6L93.7 99.2L98 90.5Z"
            fill="url(#starGrad)"
          />
        </g>

        <defs>
          <linearGradient id="calendarBodyGrad" x1="28" y1="36" x2="124" y2="134" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F8FAFC" />
          </linearGradient>
          <linearGradient id="calendarHeaderGrad" x1="28" y1="36" x2="124" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="starGrad" x1="84" y1="90" x2="112" y2="117" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="starShadow" x="80" y="88" width="36" height="36" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#B45309" floodOpacity="0.28" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

const OrganizerHeroSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl bg-white border border-border/80 p-5 sm:p-7 shadow-xs">
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-3 flex-1">
        <div className="skeleton w-24 h-4 rounded" />
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="skeleton h-4 w-full max-w-sm rounded" />
        <div className="flex gap-2.5 pt-2">
          <div className="skeleton w-28 h-10 rounded-xl" />
          <div className="skeleton w-32 h-10 rounded-xl" />
        </div>
      </div>
      <div className="skeleton w-24 h-24 sm:w-32 sm:h-32 rounded-2xl shrink-0" />
    </div>
  </div>
);

const OrganizerMetricsSkeleton = () => (
  <div className="bg-white border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
    <div className="grid grid-cols-4 divide-x divide-border/60">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="px-2 flex flex-col items-center space-y-2">
          <div className="skeleton w-10 h-10 rounded-full" />
          <div className="skeleton h-5 w-12 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      ))}
    </div>
  </div>
);

const OrganizerChartsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div className="space-y-1.5 mb-4">
        <div className="skeleton h-4 w-36 rounded" />
        <div className="skeleton h-3 w-56 rounded" />
      </div>
      <div className="skeleton w-full h-60 rounded-xl" />
    </div>
    <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div className="space-y-1.5 mb-4">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-3 w-44 rounded" />
      </div>
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

const OrganizerRecentEventsSkeleton = () => (
  <div className="bg-white border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-44 rounded" />
        <div className="skeleton h-3 w-56 rounded" />
      </div>
      <div className="skeleton h-4 w-16 rounded" />
    </div>
    <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-4 w-36 rounded" />
              <div className="skeleton h-3 w-48 rounded" />
            </div>
          </div>
          <div className="skeleton w-16 h-7 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

export default function OverviewTab({
  events = [],
  registrations = [],
  user,
  navigate,
  onSelectTab,
  onInspectEvent,
  onOpenCompetitions,
  showToast,
  userLoading = false,
  eventsLoading = false,
}) {
  const isLongWait = useLongWait(userLoading || eventsLoading);
  const total = events.length;
  const approved = events.filter(e => e.status === 'approved').length;
  const pending = events.filter(e => e.status === 'pending').length;
  const rejected = events.filter(e => e.status === 'rejected').length;

  // Real registrations count
  const totalRegs =
    registrations.length > 0
      ? registrations.length
      : events.reduce((sum, e) => sum + (e.linkedEvent?.stats?.registrationCount || e.registrationCount || 0), 0);

  // Real views count
  const totalViews = events.reduce(
    (sum, e) => sum + (e.linkedEvent?.stats?.viewCount || 0),
    0
  );

  // Real total prize pool
  const totalPrizePool = events.reduce((sum, e) => {
    const raw = parseInt(String(e.totalPrize || '').replace(/[^0-9]/g, ''), 10);
    return sum + (isNaN(raw) ? 0 : raw);
  }, 0);

  // Dynamic time-based greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'GOOD MORNING,';
    if (hr < 17) return 'GOOD AFTERNOON,';
    return 'GOOD EVENING,';
  };

  // Prepare chart data for up to top 6 events
  const chartData = events.slice(0, 6).map(e => {
    const name = e.eventName?.length > 16 ? e.eventName.slice(0, 14) + '…' : e.eventName;
    const views = e.linkedEvent?.stats?.viewCount || 0;
    const regs =
      registrations.filter(r => (r.event?._id || r.event) === (e.linkedEvent?._id || e.linkedEvent)).length ||
      e.linkedEvent?.stats?.registrationCount ||
      e.registrationCount ||
      0;
    return {
      name,
      views,
      registrations: regs,
    };
  });

  const copyLink = async (url) => {
    if (!url || url === '#') {
      showToast?.('No registration link provided', 'info');
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast?.('Link copied to clipboard!', 'success');
    } catch {
      showToast?.('Failed to copy link', 'error');
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <LongWaitNotice isLongWait={isLongWait} />

      {/* ── 1. Welcome / Hero Section ── */}
      <ProgressiveSection
        isLoading={userLoading}
        skeleton={<OrganizerHeroSkeleton />}
        wrapperKey="organizer-hero"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F5F3FF] via-[#EEF2FF] to-[#E0E7FF]/70 border border-[#C7D2FE]/60 p-5 sm:p-7 shadow-xs">
          {/* Subtle curved background blur/glow */}
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-gradient-to-br from-primary/15 to-purple-400/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 right-28 w-44 h-44 rounded-full bg-indigo-300/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            {/* Left Content Area */}
            <div className="min-w-0 flex-1">
              <span className="font-heading font-bold text-[11px] text-primary tracking-wider uppercase inline-block mb-1">
                {getGreeting()}
              </span>

              <h2 className="font-heading font-extrabold text-[22px] sm:text-[26px] text-text-1 tracking-tight leading-tight">
                Welcome back,<br />
                <span className="text-text-1">{user?.name || 'FestNest'}</span> 👋
              </h2>

              <p className="text-[12.5px] sm:text-[13.5px] text-text-2 mt-1.5 max-w-xs sm:max-w-md leading-relaxed">
                Create, manage and track your campus events — all in one place.
              </p>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2.5 mt-4 sm:mt-5 flex-wrap">
                <button
                  type="button"
                  onClick={() => navigate('/host')}
                  className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold text-[13px] shadow-sm hover:shadow-indigo transition-all cursor-pointer"
                >
                  <Plus size={16} strokeWidth={2.6} />
                  <span>Post Event</span>
                  <ArrowRight size={14} strokeWidth={2.4} className="ml-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('events')}
                  className="inline-flex items-center justify-center px-4.5 py-2.5 rounded-xl bg-white/90 hover:bg-white active:scale-[0.98] border border-primary/20 hover:border-primary/40 text-primary font-bold text-[13px] shadow-2xs transition-all cursor-pointer"
                >
                  <span>Manage Events</span>
                </button>
              </div>
            </div>

            {/* Right Illustration with gentle float */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="shrink-0 hidden xs:flex items-center justify-center mr-1"
            >
              <Calendar3DIllustration />
            </motion.div>
          </div>
        </div>
      </ProgressiveSection>

      {/* ── 2. Organizer Key Statistics Strip ── */}
      <ProgressiveSection
        isLoading={eventsLoading}
        skeleton={<OrganizerMetricsSkeleton />}
        wrapperKey="organizer-metrics"
      >
        <div className="bg-white border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-4 divide-x divide-border/60 text-center">
            {/* Total Events */}
            <div
              onClick={() => onSelectTab('events')}
              className="px-1.5 sm:px-3 cursor-pointer group"
              title="View all events"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 group-hover:bg-blue-100 transition-all shadow-2xs">
                <CalendarDays size={18} strokeWidth={2.2} />
              </div>
              <div className="font-heading font-extrabold text-[18px] sm:text-[22px] text-text-1 leading-none mb-1 group-hover:text-primary transition-colors">
                {total}
              </div>
              <div className="text-[10px] sm:text-[12px] text-text-3 font-medium leading-tight">
                Total Events
              </div>
            </div>

            {/* Live Events */}
            <div
              onClick={() => onSelectTab('events')}
              className="px-1.5 sm:px-3 cursor-pointer group"
              title="View live events"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 group-hover:bg-emerald-100 transition-all shadow-2xs">
                <TrendingUp size={18} strokeWidth={2.2} />
              </div>
              <div className="font-heading font-extrabold text-[18px] sm:text-[22px] text-text-1 leading-none mb-1 group-hover:text-emerald-600 transition-colors">
                {approved}
              </div>
              <div className="text-[10px] sm:text-[12px] text-text-3 font-medium leading-tight">
                Live Events
              </div>
            </div>

            {/* Under Review */}
            <div
              onClick={() => onSelectTab('events')}
              className="px-1.5 sm:px-3 cursor-pointer group"
              title="View pending events"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 group-hover:bg-amber-100 transition-all shadow-2xs">
                <Clock size={18} strokeWidth={2.2} />
              </div>
              <div className="font-heading font-extrabold text-[18px] sm:text-[22px] text-text-1 leading-none mb-1 group-hover:text-amber-600 transition-colors">
                {pending}
              </div>
              <div className="text-[10px] sm:text-[12px] text-text-3 font-medium leading-tight">
                Under Review
              </div>
            </div>

            {/* Prize Pool */}
            <div
              onClick={() => onSelectTab('events')}
              className="px-1 sm:px-3 cursor-pointer group min-w-0"
              title="View prize pool events"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 group-hover:bg-purple-100 transition-all shadow-2xs">
                <Trophy size={18} strokeWidth={2.2} />
              </div>
              <div className="font-heading font-extrabold text-[14px] sm:text-[18px] text-text-1 leading-none mb-1 truncate px-0.5 group-hover:text-purple-600 transition-colors">
                {totalPrizePool > 0 ? `₹${totalPrizePool.toLocaleString('en-IN')}` : '₹0'}
              </div>
              <div className="text-[10px] sm:text-[12px] text-text-3 font-medium leading-tight">
                Prize Pool
              </div>
            </div>
          </div>
        </div>
      </ProgressiveSection>

      {/* ── 3. Quick Actions Section ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-[16px] sm:text-[18px] text-text-1 tracking-tight">
            Quick Actions
          </h3>
          <button
            type="button"
            onClick={() => onSelectTab('events')}
            className="text-[12px] font-semibold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>See All</span>
            <ArrowRight size={13} strokeWidth={2.2} />
          </button>
        </div>

        <div className="bg-white border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            {/* Post Event */}
            <button
              type="button"
              onClick={() => navigate('/host')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 group-active:scale-95 transition-all flex items-center justify-center shadow-2xs">
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <span className="font-heading font-bold text-[12px] sm:text-[13px] text-text-1 mt-2 leading-tight group-hover:text-primary transition-colors">
                Post Event
              </span>
              <span className="text-[10.5px] sm:text-[11px] text-text-3 mt-0.5 hidden xs:block leading-tight truncate max-w-[80px]">
                Create new event
              </span>
            </button>

            {/* Manage Events */}
            <button
              type="button"
              onClick={() => onSelectTab('events')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-active:scale-95 transition-all flex items-center justify-center shadow-2xs">
                <List size={20} strokeWidth={2.3} />
              </div>
              <span className="font-heading font-bold text-[12px] sm:text-[13px] text-text-1 mt-2 leading-tight group-hover:text-emerald-600 transition-colors">
                Manage Events
              </span>
              <span className="text-[10.5px] sm:text-[11px] text-text-3 mt-0.5 hidden xs:block leading-tight truncate max-w-[80px]">
                View & edit
              </span>
            </button>

            {/* Analytics */}
            <button
              type="button"
              onClick={() => onSelectTab('analytics')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-active:scale-95 transition-all flex items-center justify-center shadow-2xs">
                <BarChart2 size={20} strokeWidth={2.3} />
              </div>
              <span className="font-heading font-bold text-[12px] sm:text-[13px] text-text-1 mt-2 leading-tight group-hover:text-blue-600 transition-colors">
                Analytics
              </span>
              <span className="text-[10.5px] sm:text-[11px] text-text-3 mt-0.5 hidden xs:block leading-tight truncate max-w-[80px]">
                Event insights
              </span>
            </button>

            {/* Organizer Profile */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-active:scale-95 transition-all flex items-center justify-center shadow-2xs">
                <User size={20} strokeWidth={2.3} />
              </div>
              <span className="font-heading font-bold text-[12px] sm:text-[13px] text-text-1 mt-2 leading-tight group-hover:text-rose-600 transition-colors">
                Organizer Profile
              </span>
              <span className="text-[10.5px] sm:text-[11px] text-text-3 mt-0.5 hidden xs:block leading-tight truncate max-w-[80px]">
                Update details
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. Engagement Analytics (Only if flag is enabled) ── */}
      {SHOW_ENGAGEMENT_ANALYTICS && (
        <ProgressiveSection
          isLoading={eventsLoading}
          skeleton={<OrganizerChartsSkeleton />}
          wrapperKey="organizer-charts"
        >
          <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-heading font-bold text-[15px] text-text-1">Event Engagement</h3>
                <p className="text-[12px] text-text-3">Views vs Registrations across your recent submissions</p>
              </div>
              <button
                onClick={() => onSelectTab('analytics')}
                className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Detailed Analytics <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex-1 min-h-[240px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F1EF" />
                    <XAxis dataKey="name" stroke="#8E8E93" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8E8E93" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E4E4E0',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="views" name="Views" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="registrations" name="Registrations" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-surface-1 rounded-xl border border-dashed border-border">
                  <BarChart2 size={32} className="text-text-4 mb-2" />
                  <div className="font-heading text-[14px] font-bold text-text-2">No event analytics yet</div>
                  <div className="text-[12px] text-text-4 mt-0.5">Post an event to start tracking views and signups</div>
                </div>
              )}
            </div>
          </div>
        </ProgressiveSection>
      )}

      {/* ── 5. Recent Event Submissions Section ── */}
      <ProgressiveSection
        isLoading={eventsLoading}
        skeleton={<OrganizerRecentEventsSkeleton />}
        wrapperKey="organizer-recent-events"
      >
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-[16px] sm:text-[18px] text-text-1 tracking-tight">
                Recent Event Submissions
              </h3>
              <p className="text-[11.5px] sm:text-[12px] text-text-3 mt-0.5">
                Your latest published and submitted events
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('events')}
              className="text-[12px] font-semibold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All ({events.length})</span>
              <ArrowRight size={13} strokeWidth={2.2} />
            </button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-border/80 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <CalendarDays size={24} />
              </div>
              <h4 className="font-heading font-bold text-[15px] text-text-1">No events posted yet</h4>
              <p className="text-[13px] text-text-3 mt-1 max-w-sm mx-auto">
                Ready to host your college fest, hackathon, or cultural event? Publish on FestNest and reach students across India.
              </p>
              <button
                type="button"
                onClick={() => navigate('/host')}
                className="mt-4 px-4.5 py-2.5 bg-primary text-white rounded-xl text-[12px] font-bold hover:bg-primary-dark transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus size={15} /> Post Your First Event
              </button>
            </div>
          ) : (
            <div className="bg-white border border-border/80 rounded-2xl overflow-hidden shadow-2xs divide-y divide-border/60">
              {events.slice(0, 5).map(ev => {
                const statusCfg = STATUS_MAP[ev.status] || STATUS_MAP.pending;
                const linkedId = ev.linkedEvent?.slug || ev.linkedEvent?._id || ev.linkedEvent;

                return (
                  <div
                    key={ev._id}
                    className="p-3.5 sm:p-4 hover:bg-surface-2/60 transition-colors group flex flex-col gap-2.5"
                  >
                    {/* Event summary row */}
                    <div
                      onClick={() => onInspectEvent(ev)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onInspectEvent(ev);
                        }
                      }}
                      className="flex items-start sm:items-center gap-3 min-w-0 cursor-pointer rounded-lg p-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {ev.bannerImage?.url ? (
                        <img
                          src={ev.bannerImage.url}
                          alt={ev.eventName}
                          className="w-12 h-12 rounded-xl object-cover border border-border/80 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-heading font-extrabold text-[18px] flex items-center justify-center shrink-0 border border-primary/20">
                          {ev.eventName?.[0]?.toUpperCase() || 'E'}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h4 className="font-heading font-bold text-[14px] sm:text-[15px] text-text-1 group-hover:text-primary transition-colors truncate">
                            {ev.eventName}
                          </h4>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bgCls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotCls}`} />
                            {statusCfg.label}
                          </span>
                        </div>

                        <div className="text-[12px] text-text-3 truncate mb-1">
                          {ev.college || ev.organization || 'Campus Event'}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-text-3 flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <CalendarDays size={12} className="text-text-4" />
                            {ev.startDate || 'TBA'}
                          </span>
                          <span className="text-text-4">•</span>
                          <span className="flex items-center gap-1 text-text-2 font-medium">
                            <Tag size={12} className="text-text-4" />
                            {ev.eventType || 'Competition'}
                          </span>
                        </div>
                      </div>

                      <ChevronRight size={18} className="text-text-4 group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block shrink-0" />
                    </div>

                    {/* Action buttons as clean pill buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 sm:border-transparent w-full sm:w-auto justify-end">
                      {ev.status === 'approved' && linkedId && (
                        <>
                          <button
                            type="button"
                            onClick={() => navigate(`/event/${linkedId}`)}
                            className="px-3.5 py-1 rounded-full bg-primary-light hover:bg-primary/20 text-primary text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                            title="View live event page"
                          >
                            <ExternalLink size={11} />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenCompetitions(ev)}
                            className="px-3.5 py-1 rounded-full bg-primary-light hover:bg-primary/20 text-primary text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                            title="Manage competition tracks"
                          >
                            <Layers size={11} />
                            <span>Tracks</span>
                          </button>
                        </>
                      )}

                      {ev.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => onInspectEvent(ev)}
                          className="px-3.5 py-1 rounded-full bg-primary-light hover:bg-primary/20 text-primary text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                          title="View event details"
                        >
                          <Eye size={11} />
                          <span>View</span>
                        </button>
                      )}

                      {ev.registrationUrl && (
                        <button
                          type="button"
                          onClick={() => copyLink(ev.registrationUrl)}
                          className="p-1.5 rounded-full text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors cursor-pointer"
                          title="Copy registration link"
                        >
                          <Copy size={13} />
                        </button>
                      )}

                      {ev.status === 'rejected' && (
                        <button
                          type="button"
                          onClick={() => navigate('/host')}
                          className="px-3.5 py-1 rounded-full bg-amber-bg text-amber border border-amber-border text-[11px] font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <PenSquare size={11} />
                          <span>Resubmit</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </ProgressiveSection>
    </div>
  );
}


