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

const STATUS_MAP = {
  pending:  { label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border-amber-200', Icon: Clock },
  approved: { label: 'Live',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  rejected: { label: 'Rejected',     cls: 'bg-rose-50 text-rose-700 border-rose-200', Icon: Clock },
};

export default function OverviewTab({
  events = [],
  registrations = [],
  user,
  navigate,
  onSelectTab,
  onInspectEvent,
  onOpenCompetitions,
  showToast,
}) {
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
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 sm:p-7 text-white shadow-md">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-white/10 pointer-events-none blur-xl" />
        <div className="absolute bottom-0 right-24 -mb-10 w-36 h-36 rounded-full bg-indigo-400/20 pointer-events-none blur-lg" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-md text-[11px] font-bold tracking-wider uppercase text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Organizer Console
              </span>
              <span className="text-white/80 text-[12px] font-mono">
                {user?.college || user?.organization || 'Campus Partner'}
              </span>
            </div>
            <h2 className="font-heading text-[22px] sm:text-[26px] font-bold tracking-tight text-white leading-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Organizer'}
            </h2>
            <p className="text-white/80 text-[13px] mt-1 max-w-xl leading-relaxed">
              Track your campus events, monitor attendee registrations, and manage individual competition tracks in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
            <button
              onClick={() => navigate('/host')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 rounded-xl font-bold text-[13px] shadow-sm hover:bg-slate-50 transition-all"
            >
              <Plus size={16} strokeWidth={2.5} />
              Post Event
            </button>
            <button
              onClick={() => onSelectTab('events')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-[13px] transition-all backdrop-blur-xs"
            >
              Manage Events
            </button>
          </div>
        </div>

        {/* Quick summary pill strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="font-mono text-[20px] font-bold leading-none">{total}</div>
            <div className="text-[11px] text-white/70 mt-1">Submitted Events</div>
          </div>
          <div>
            <div className="font-mono text-[20px] font-bold leading-none text-emerald-300">{approved}</div>
            <div className="text-[11px] text-white/70 mt-1">Live Events</div>
          </div>
          <div>
            <div className="font-mono text-[20px] font-bold leading-none text-amber-300">{pending}</div>
            <div className="text-[11px] text-white/70 mt-1">Under Review</div>
          </div>
          <div>
            <div className="font-mono text-[20px] font-bold leading-none text-purple-200">{totalRegs}</div>
            <div className="text-[11px] text-white/70 mt-1">Total Registrations</div>
          </div>
        </div>
      </div>

      {/* ── Key Metrics KPI Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <OrganizerStatCard
          icon={CalendarDays}
          label="Total Events"
          value={total}
          color="indigo"
          onClick={() => onSelectTab('events')}
        />
        <OrganizerStatCard
          icon={CheckCircle2}
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
          icon={Users}
          label="Registrations"
          value={totalRegs}
          color="purple"
          onClick={() => onSelectTab('participants')}
        />
        <OrganizerStatCard
          icon={Eye}
          label="Event Views"
          value={totalViews}
          color="blue"
          onClick={() => onSelectTab('analytics')}
        />
        <OrganizerStatCard
          icon={Trophy}
          label="Prize Pool"
          value={totalPrizePool > 0 ? `₹${totalPrizePool.toLocaleString('en-IN')}` : '—'}
          color="amber"
          onClick={() => onSelectTab('analytics')}
        />
      </div>

      {/* ── Visual Analytics & Quick Actions Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col">
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

        {/* Quick Operations (1 col) */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col">
          <h3 className="font-heading font-bold text-[15px] text-text-1 mb-1">Quick Actions</h3>
          <p className="text-[12px] text-text-3 mb-4">Fast shortcuts to common operations</p>

          <div className="space-y-2.5 flex-1">
            <button
              onClick={() => navigate('/host')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-1 hover:border-primary/40 hover:bg-primary-light/40 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Plus size={18} strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-text-1">Post New Event</div>
                <div className="text-[11px] text-text-3 truncate">Submit fest, hackathon, or workshop</div>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('participants')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-1 hover:border-primary/40 hover:bg-primary-light/40 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-200">
                <FileSpreadsheet size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-text-1">Export Participants</div>
                <div className="text-[11px] text-text-3 truncate">Download attendee list to CSV</div>
              </div>
            </button>

            <button
              onClick={() => onSelectTab('tips')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-1 hover:border-primary/40 hover:bg-primary-light/40 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200">
                <Sparkles size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-text-1">Growth Playbook</div>
                <div className="text-[11px] text-text-3 truncate">Tactics to boost registrations 3×</div>
              </div>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-1 hover:border-primary/40 hover:bg-primary-light/40 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-200">
                <TrendingUp size={18} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-text-1">Organizer Profile</div>
                <div className="text-[11px] text-text-3 truncate">Update college & contact info</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Recent Event Submissions ── */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-heading font-bold text-[15px] text-text-1">Recent Event Submissions</h3>
            <p className="text-[12px] text-text-3">Overview of your latest published and submitted events</p>
          </div>
          <button
            onClick={() => onSelectTab('events')}
            className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All ({events.length}) <ArrowRight size={12} />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 px-4 bg-surface-1 rounded-xl border border-dashed border-border">
            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={24} />
            </div>
            <h4 className="font-heading font-bold text-[15px] text-text-1">No events posted yet</h4>
            <p className="text-[13px] text-text-3 mt-1 max-w-sm mx-auto">
              Ready to host your college fest, hackathon, or cultural event? Publish on FestNest and reach thousands of students.
            </p>
            <button
              onClick={() => navigate('/host')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-[12px] font-bold hover:bg-primary-dark transition-all inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Post Your First Event
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {events.slice(0, 5).map(ev => {
              const statusCfg = STATUS_MAP[ev.status] || STATUS_MAP.pending;
              const StatusIcon = statusCfg.Icon;
              const linkedId = ev.linkedEvent?.slug || ev.linkedEvent?._id || ev.linkedEvent;

              return (
                <div
                  key={ev._id}
                  className="p-3.5 sm:p-4 hover:bg-surface-1 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div
                    onClick={() => onInspectEvent(ev)}
                    className="flex items-start sm:items-center gap-3 min-w-0 cursor-pointer flex-1"
                  >
                    {ev.bannerImage?.url ? (
                      <img
                        src={ev.bannerImage.url}
                        alt={ev.eventName}
                        className="w-12 h-12 rounded-xl object-cover border border-border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary-light text-primary font-bold text-[16px] flex items-center justify-center flex-shrink-0 border border-primary/20">
                        {ev.eventName?.[0]?.toUpperCase() || 'E'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[14px] text-text-1 hover:text-primary transition-colors truncate">
                          {ev.eventName}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.cls}`}>
                          <StatusIcon size={10} strokeWidth={2.2} />
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-text-3 mt-1 flex-wrap">
                        <span>{ev.college}</span>
                        <span>•</span>
                        <span className="font-mono">{ev.startDate || 'TBA'}</span>
                        <span>•</span>
                        <span className="font-semibold text-primary">{ev.eventType || 'Event'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    {ev.status === 'approved' && linkedId && (
                      <>
                        <button
                          type="button"
                          onClick={() => navigate(`/event/${linkedId}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-2 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="View live page"
                        >
                          <ExternalLink size={12} />
                          Live
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenCompetitions(ev)}
                          className="px-2.5 py-1.5 rounded-lg bg-primary-light text-primary hover:bg-primary-light/80 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Manage sub-events"
                        >
                          <Layers size={12} />
                          Tracks
                        </button>
                      </>
                    )}

                    {ev.registrationUrl && (
                      <button
                        type="button"
                        onClick={() => copyLink(ev.registrationUrl)}
                        className="p-1.5 rounded-lg text-text-3 hover:text-text-1 hover:bg-surface-2 transition-colors"
                        title="Copy registration link"
                      >
                        <Copy size={14} />
                      </button>
                    )}

                    {ev.status === 'rejected' && (
                      <button
                        type="button"
                        onClick={() => navigate('/host')}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors flex items-center gap-1"
                      >
                        <PenSquare size={12} />
                        Resubmit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

