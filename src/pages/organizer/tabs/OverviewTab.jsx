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
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Award,
  ChevronRight,
  Tag,
  User,
  ListChecks,
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
import OrganizerStatCard from '../components/OrganizerStatCard';
import { SHOW_ENGAGEMENT_ANALYTICS } from '../config';
import useLongWait from '../../../hooks/useLongWait';
import LongWaitNotice from '../../../components/loading/LongWaitNotice';
import ProgressiveSection from '../../../components/loading/ProgressiveSection';

const STATUS_MAP = {
  pending:  { label: 'Under Review', bgCls: 'bg-amber-bg text-amber border-amber-border', dotCls: 'bg-amber' },
  approved: { label: 'Live',         bgCls: 'bg-green-bg text-green border-green-border', dotCls: 'bg-green animate-pulse' },
  rejected: { label: 'Rejected',     bgCls: 'bg-red-bg text-red border-red-border', dotCls: 'bg-red' },
  draft:    { label: 'Draft',        bgCls: 'bg-surface-3 text-text-3 border-border', dotCls: 'bg-text-4' },
};

const OrganizerHeroSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-[#F5F3FF]/50 to-[#FDF4FF]/40 border border-primary/10 p-6 sm:p-7 shadow-1">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="space-y-3">
        <div className="skeleton w-28 h-4 rounded-md" />
        <div className="skeleton h-8 w-64 rounded-lg" />
        <div className="skeleton h-4 w-full max-w-md rounded" />
        <div className="flex gap-3 pt-2">
          <div className="skeleton w-32 h-10 rounded-xl" />
          <div className="skeleton w-36 h-10 rounded-xl" />
        </div>
      </div>
      <div className="hidden md:block">
        <div className="skeleton w-28 h-28 rounded-2xl" />
      </div>
    </div>
  </div>
);

const OrganizerMetricsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white border border-border rounded-xl p-4 shadow-1 space-y-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="skeleton h-7 w-16 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    ))}
  </div>
);

const OrganizerChartsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5 shadow-1 flex flex-col justify-between">
      <div className="space-y-1.5 mb-4">
        <div className="skeleton h-4 w-36 rounded" />
        <div className="skeleton h-3 w-56 rounded" />
      </div>
      <div className="skeleton w-full h-60 rounded-xl" />
    </div>

    <div className="bg-white border border-border rounded-2xl p-5 shadow-1 flex flex-col justify-between">
      <div className="space-y-1.5 mb-4">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-3 w-44 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

const OrganizerRecentEventsSkeleton = () => (
  <div className="bg-white border border-border rounded-2xl p-5 shadow-1 space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <div className="skeleton h-4 w-44 rounded" />
        <div className="skeleton h-3 w-64 rounded" />
      </div>
      <div className="skeleton h-4 w-16 rounded" />
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white border border-border rounded-xl p-4 shadow-1 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-40 rounded" />
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-7 w-16 rounded-full" />
            <div className="skeleton h-7 w-16 rounded-full" />
          </div>
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

  // Calculate real total registrations: count from registrations array or fallback to sum of linkedEvent stats
  const totalRegs =
    registrations.length > 0
      ? registrations.length
      : events.reduce((sum, e) => sum + (e.linkedEvent?.stats?.registrationCount || e.registrationCount || 0), 0);

  // Calculate real total views: sum of linkedEvent.stats.viewCount
  const totalViews = events.reduce(
    (sum, e) => sum + (e.linkedEvent?.stats?.viewCount || 0),
    0
  );

  // Calculate total prize pool
  const totalPrizePool = events.reduce((sum, e) => {
    const raw = parseInt(String(e.totalPrize || '').replace(/[^0-9]/g, ''), 10);
    return sum + (isNaN(raw) ? 0 : raw);
  }, 0);

  // Time-aware greeting
  const currentHour = new Date().getHours();
  const greetingSalutation =
    currentHour < 12 ? 'GOOD MORNING,' : currentHour < 18 ? 'GOOD AFTERNOON,' : 'GOOD EVENING,';

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

  // Quick Action items configured with existing pastel tokens
  const quickActions = [
    {
      title: 'Post Event',
      sub: 'Create new event',
      icon: Plus,
      circleCls: 'bg-primary-light text-primary border border-primary/20',
      onClick: () => navigate('/host'),
    },
    {
      title: 'Manage Events',
      sub: 'View & edit',
      icon: ListChecks,
      circleCls: 'bg-green-bg text-green border border-green-border',
      onClick: () => onSelectTab('events'),
    },
    {
      title: 'Analytics',
      sub: 'Event insights',
      icon: BarChart3,
      circleCls: 'bg-blue-bg text-blue border border-blue/20',
      onClick: () => onSelectTab('analytics'),
    },
    {
      title: 'Organizer Profile',
      sub: 'Update details',
      icon: User,
      circleCls: 'bg-[#FFF1F2] text-rose-700 border border-rose-200',
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <div className="space-y-6">
      <LongWaitNotice isLongWait={isLongWait} />

      {/* ── 1. Hero / Welcome Section ── */}
      <ProgressiveSection
        isLoading={userLoading}
        skeleton={<OrganizerHeroSkeleton />}
        wrapperKey="organizer-hero"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-[#F5F3FF] to-[#FDF4FF] border border-primary/15 p-6 sm:p-7 shadow-1">
          {/* Subtle gradient radial blur accents */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 rounded-full bg-primary/10 pointer-events-none blur-2xl" />
          <div className="absolute bottom-0 right-32 -mb-12 w-44 h-44 rounded-full bg-fuchsia-400/10 pointer-events-none blur-xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Greeting & Description */}
            <div className="max-w-xl">
              <div className="font-mono text-[11px] sm:text-[12px] font-bold tracking-wider text-primary uppercase mb-1.5">
                {greetingSalutation}
              </div>

              <h2 className="font-heading text-[24px] sm:text-[30px] font-extrabold tracking-tight text-text-1 leading-tight mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'FestNest'} 👋
              </h2>

              <p className="text-text-2 text-[13px] sm:text-[14px] leading-relaxed mb-5">
                Create, manage and track your campus events — all in one place.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => navigate('/host')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-[13px] shadow-xs hover:shadow-indigo active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Post Event</span>
                  <ArrowRight size={14} className="opacity-90 ml-0.5" />
                </button>

                <button
                  onClick={() => onSelectTab('events')}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-white/90 hover:bg-white border border-border hover:border-primary/40 text-text-1 rounded-xl font-semibold text-[13px] shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <span>Manage Events</span>
                </button>
              </div>
            </div>

            {/* Right: Illustrative decorative accent (Reusable Lucide composition) */}
            <div className="hidden md:flex items-center justify-center relative w-36 h-36 flex-shrink-0 select-none pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-purple-300/20 to-fuchsia-400/20 rounded-3xl blur-xl" />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-28 h-28 bg-white/90 backdrop-blur-md rounded-2xl border border-white shadow-2 flex flex-col items-center justify-center p-3 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-light to-purple-100 text-primary flex items-center justify-center mb-1.5 shadow-xs">
                  <CalendarDays size={26} strokeWidth={2.2} />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-text-1 font-heading">
                  <Sparkles size={12} className="text-amber-500 fill-amber-400" />
                  <span>Organizer</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </ProgressiveSection>

      {/* ── 2. Stats Row ── */}
      <ProgressiveSection
        isLoading={eventsLoading}
        skeleton={<OrganizerMetricsSkeleton />}
        wrapperKey="organizer-metrics"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <OrganizerStatCard
            icon={CalendarDays}
            label="Total Events"
            value={total}
            color="indigo"
            onClick={() => onSelectTab('events')}
          />
          <OrganizerStatCard
            icon={TrendingUp}
            label="Live Events"
            value={approved}
            color="emerald"
            badge={total > 0 ? `${Math.round((approved / total) * 100)}%` : null}
            onClick={() => onSelectTab('events')}
          />
          <OrganizerStatCard
            icon={Clock}
            label="Under Review"
            value={pending}
            color="amber"
            onClick={() => onSelectTab('events')}
          />
          <OrganizerStatCard
            icon={Trophy}
            label="Prize Pool"
            value={totalPrizePool > 0 ? `₹${totalPrizePool.toLocaleString('en-IN')}` : '₹0'}
            color="purple"
            onClick={() => onSelectTab('analytics')}
          />
        </div>
      </ProgressiveSection>

      {/* ── 3. Quick Actions ── */}
      <ProgressiveSection
        isLoading={eventsLoading}
        skeleton={<OrganizerChartsSkeleton />}
        wrapperKey="organizer-quick-actions"
      >
        <div className="bg-white border border-border rounded-2xl p-5 shadow-1">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-heading font-bold text-[16px] text-text-1">Quick Actions</h3>
              <p className="text-[12px] text-text-3">Direct shortcuts for managing your campus events</p>
            </div>
            <button
              onClick={() => onSelectTab('events')}
              className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>See All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map(action => {
              const ActionIcon = action.icon;
              return (
                <motion.button
                  key={action.title}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  onClick={action.onClick}
                  className="flex flex-col items-center text-center p-3.5 sm:p-4 rounded-xl border border-border/80 bg-surface-2/40 hover:bg-surface-2 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 ${action.circleCls} shadow-xs group-hover:scale-105 transition-transform`}>
                    <ActionIcon size={20} strokeWidth={2.2} />
                  </div>
                  <div className="font-heading font-bold text-[13px] text-text-1 group-hover:text-primary transition-colors truncate w-full">
                    {action.title}
                  </div>
                  <div className="text-[11px] text-text-3 truncate w-full mt-0.5">
                    {action.sub}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </ProgressiveSection>

      {/* ── Optional Analytics Chart (if SHOW_ENGAGEMENT_ANALYTICS) ── */}
      {SHOW_ENGAGEMENT_ANALYTICS && (
        <div className="bg-white border border-border rounded-2xl p-5 shadow-1">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-heading font-bold text-[15px] text-text-1">Event Engagement</h3>
              <p className="text-[12px] text-text-3">Views vs Registrations across your recent submissions</p>
            </div>
            <button
              onClick={() => onSelectTab('analytics')}
              className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              Detailed Analytics <ArrowRight size={12} />
            </button>
          </div>

          <div className="min-h-[240px]">
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
      )}

      {/* ── 4. Recent Event Submissions ── */}
      <ProgressiveSection
        isLoading={eventsLoading}
        skeleton={<OrganizerRecentEventsSkeleton />}
        wrapperKey="organizer-recent-events"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-bold text-[16px] text-text-1">Recent Event Submissions</h3>
              <p className="text-[12px] text-text-3">Your latest published and submitted events</p>
            </div>
            <button
              onClick={() => onSelectTab('events')}
              className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              View All ({events.length}) <ArrowRight size={12} />
            </button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-border shadow-1">
              <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto mb-3">
                <CalendarDays size={24} />
              </div>
              <h4 className="font-heading font-bold text-[15px] text-text-1">No events posted yet</h4>
              <p className="text-[13px] text-text-3 mt-1 max-w-sm mx-auto">
                Ready to host your college fest, hackathon, or cultural event? Publish on FestNest and reach thousands of students.
              </p>
              <button
                onClick={() => navigate('/host')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-[12px] font-bold hover:bg-primary-dark transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} /> Post Your First Event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map(ev => {
                const statusCfg = STATUS_MAP[ev.status] || STATUS_MAP.pending;
                const linkedId = ev.linkedEvent?.slug || ev.linkedEvent?._id || ev.linkedEvent;

                return (
                  <motion.div
                    key={ev._id}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white border border-border rounded-xl p-4 shadow-1 hover:shadow-2 hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group"
                  >
                    {/* Left: Initial Avatar + Info (clickable to inspect) */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`Inspect event details for ${ev.eventName}`}
                      onClick={() => onInspectEvent(ev)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onInspectEvent(ev);
                        }
                      }}
                      className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1 cursor-pointer rounded-lg p-1 -m-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {ev.bannerImage?.url ? (
                        <img
                          src={ev.bannerImage.url}
                          alt={ev.eventName}
                          className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-heading font-bold text-[18px] flex items-center justify-center flex-shrink-0 border border-primary/20">
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

                        <div className="flex items-center gap-3 text-[11px] text-text-3 flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <CalendarDays size={12} className="text-text-4" />
                            {ev.startDate || 'TBA'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-text-2 font-medium">
                            <Tag size={12} className="text-text-4" />
                            {ev.eventType || 'Competition'}
                          </span>
                        </div>
                      </div>

                      <ChevronRight size={18} className="text-text-4 group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block shrink-0" />
                    </div>

                    {/* Action buttons as small pill buttons */}
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
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </ProgressiveSection>
    </div>
  );
}


