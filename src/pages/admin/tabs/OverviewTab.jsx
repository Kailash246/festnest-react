// src/pages/admin/tabs/OverviewTab.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, CalendarDays, Hourglass, CheckCircle2, Ticket,
  ArrowUpRight, Plus, Megaphone, AlertCircle, ChevronRight,
  TrendingUp, BarChart2, ShieldCheck, Sparkles, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid
} from 'recharts';
import { admin } from '../../../services/api';
import StatCard from '../components/StatCard';

const CATEGORY_COLORS = [
  '#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6'
];

export default function OverviewTab({
  showToast,
  onSelectTab,
  onSelectUser,
  onOpenCreateEvent,
  onPreviewSubmission,
}) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await admin.stats();
      setStats(res.data);
    } catch (err) {
      showToast?.(err.message || 'Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-neutral-500">Loading analytics and dashboard metrics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 shadow-sm my-6">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-neutral-800">Unable to load dashboard metrics</h3>
        <p className="text-sm text-neutral-500 mt-1 mb-4">Please check your network connection or try refreshing.</p>
        <button
          onClick={() => fetchStats(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    totals = {},
    categoryBreakdown = [],
    registrationsTrend = [],
    recentUsers = [],
    recentSubmissions = [],
  } = stats;

  // Format trend data for Recharts
  const trendChartData = registrationsTrend.map(item => ({
    date: item._id ? item._id.slice(5) : '—', // MM-DD
    fullDate: item._id,
    registrations: item.count || 0,
  }));

  // Format category data
  const categoryChartData = categoryBreakdown.map((item, index) => ({
    name: item._id || 'Uncategorized',
    count: item.count || 0,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  const pendingCount = totals.pendingSubmissions || 0;
  const openTicketCount = totals.openTickets || 0;

  return (
    <div className="space-y-6">
      {/* Actionable Banner if there are pending reviews or tickets */}
      {(pendingCount > 0 || openTicketCount > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center flex-shrink-0 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">
                Action Items Awaiting Admin Attention
              </h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                {pendingCount > 0 && <span><strong>{pendingCount}</strong> pending event submission{pendingCount > 1 ? 's' : ''} to review. </span>}
                {openTicketCount > 0 && <span><strong>{openTicketCount}</strong> support ticket{openTicketCount > 1 ? 's' : ''} awaiting response.</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {pendingCount > 0 && (
              <button
                onClick={() => onSelectTab('submissions')}
                className="flex-1 sm:flex-none px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                Review Submissions
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {openTicketCount > 0 && (
              <button
                onClick={() => onSelectTab('tickets')}
                className="flex-1 sm:flex-none px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
              >
                Open Tickets
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Total Users"
          value={totals.totalUsers}
          color="indigo"
          sub="Registered accounts"
        />
        <StatCard
          icon={<CalendarDays className="w-5 h-5" />}
          label="Live Events"
          value={totals.totalEvents}
          color="emerald"
          sub="Published on feed"
        />
        <StatCard
          icon={<Hourglass className="w-5 h-5" />}
          label="Pending Reviews"
          value={totals.pendingSubmissions}
          color={pendingCount > 0 ? "amber" : "neutral"}
          badge={pendingCount > 0 ? "Needs Review" : null}
          badgeColor="amber"
          sub="From organizers"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Registrations"
          value={totals.totalRegistrations}
          color="blue"
          sub="All-time signups"
        />
        <StatCard
          icon={<Ticket className="w-5 h-5" />}
          label="Open Tickets"
          value={totals.openTickets}
          color={openTicketCount > 0 ? "rose" : "neutral"}
          badge={openTicketCount > 0 ? `${openTicketCount} Open` : null}
          badgeColor="rose"
          sub="Awaiting help"
        />
      </div>

      {/* Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Registration Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-neutral-900">Registration Activity (Last 7 Days)</h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">Daily volume of event registrations across all colleges</p>
            </div>
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              title="Refresh chart data"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>

          <div className="w-full h-64 mt-2 min-w-0">
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    dy={5}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-neutral-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-neutral-700">
                            <p className="text-neutral-400 font-medium">{payload[0].payload.fullDate || label}</p>
                            <p className="text-sm font-bold text-white mt-0.5">
                              {payload[0].value} {payload[0].value === 1 ? 'registration' : 'registrations'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#regGradient)"
                    dot={{ fill: '#4F46E5', strokeWidth: 2, r: 3, stroke: '#FFFFFF' }}
                    activeDot={{ r: 5, fill: '#4F46E5', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                No recent registration data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown (1 Col) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
                  <BarChart2 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-neutral-900">Events by Category</h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">Distribution across disciplines</p>
            </div>
          </div>

          <div className="space-y-3 my-auto">
            {categoryChartData.length > 0 ? (
              categoryChartData.map((item) => {
                const max = Math.max(...categoryChartData.map(c => c.count), 1);
                const pct = Math.round((item.count / max) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-neutral-700">{item.name}</span>
                      <span className="text-neutral-500 tabular-nums">{item.count} events</span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-neutral-400">
                No events categorized yet.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Total Categories</span>
            <span className="font-bold text-neutral-800">{categoryChartData.length}</span>
          </div>
        </div>
      </div>

      {/* Bottom Dual Column: Pending Submissions & Recent Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pending Submissions Feed */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                Pending Submissions Queue
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {pendingCount}
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Events submitted by student organizers awaiting approval</p>
            </div>
            <button
              onClick={() => onSelectTab('submissions')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.slice(0, 4).map((sub) => (
                <div
                  key={sub._id}
                  onClick={() => onPreviewSubmission?.(sub)}
                  className="p-3.5 rounded-xl border border-neutral-100 hover:border-indigo-200 hover:bg-neutral-50/70 transition-all flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 truncate group-hover:text-indigo-600 transition-colors">
                        {sub.eventName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                        Pending
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      {sub.college || 'Institution'} · by {sub.submittedBy?.name || 'Organizer'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreviewSubmission?.(sub);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-neutral-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                Queue is clear! All submissions reviewed.
              </div>
            )}
          </div>
        </div>

        {/* Recent Signups Feed */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Recent Signups</h3>
              <p className="text-xs text-neutral-500 mt-0.5">Latest students and organizers joining FestNest</p>
            </div>
            <button
              onClick={() => onSelectTab('users')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition"
            >
              View directory
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentUsers.length > 0 ? (
              recentUsers.slice(0, 4).map((u) => (
                <div
                  key={u._id}
                  onClick={() => onSelectUser?.(u._id)}
                  className="p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50/70 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                      {u.name?.slice(0, 2).toUpperCase() || 'FN'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-900 truncate group-hover:text-indigo-600 transition-colors">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">{u.email}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-neutral-400 flex-shrink-0 truncate max-w-[120px]">
                    {u.college || 'Student'}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-neutral-400">
                No users registered yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

