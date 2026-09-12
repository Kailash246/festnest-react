// src/pages/organizer/tabs/AnalyticsTab.jsx
import React, { useMemo } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Trophy,
  Award,
  Tag,
  IndianRupee,
  Layers,
  ArrowUpRight,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import OrganizerStatCard from '../components/OrganizerStatCard';
import { SHOW_ENGAGEMENT_ANALYTICS } from '../config';

const CATEGORY_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export default function AnalyticsTab({
  events = [],
  registrations = [],
  navigate,
}) {
  // Aggregate views & registrations
  const totalViews = useMemo(() => {
    return events.reduce((sum, e) => sum + (e.linkedEvent?.stats?.viewCount || 0), 0);
  }, [events]);

  const totalRegs = useMemo(() => {
    if (registrations.length > 0) return registrations.length;
    return events.reduce(
      (sum, e) => sum + (e.linkedEvent?.stats?.registrationCount || e.registrationCount || 0),
      0
    );
  }, [events, registrations]);

  // Overall Conversion Rate
  const conversionRate = useMemo(() => {
    if (totalViews === 0) return 0;
    return Math.round((totalRegs / totalViews) * 1000) / 10; // e.g. 14.5%
  }, [totalViews, totalRegs]);

  // Total Prize Pool
  const totalPrizePool = useMemo(() => {
    return events.reduce((sum, e) => {
      const raw = parseInt(String(e.totalPrize || '').replace(/[^0-9]/g, ''), 10);
      return sum + (isNaN(raw) ? 0 : raw);
    }, 0);
  }, [events]);

  // Top Performing Event by registrations or views
  const topEvent = useMemo(() => {
    if (events.length === 0) return null;
    return [...events].sort((a, b) => {
      const rA = a.linkedEvent?.stats?.registrationCount || a.registrationCount || 0;
      const rB = b.linkedEvent?.stats?.registrationCount || b.registrationCount || 0;
      return rB - rA;
    })[0];
  }, [events]);

  // Category distribution
  const categoryData = useMemo(() => {
    const counts = {};
    events.forEach(e => {
      const cat = e.eventType || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [events]);

  // Per-event engagement chart data
  const eventEngagementData = useMemo(() => {
    return events.map(e => {
      const name = e.eventName?.length > 18 ? e.eventName.slice(0, 16) + '…' : e.eventName;
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
  }, [events, registrations]);

  // Free vs Paid events
  const freeCount = events.filter(e => !e.isPaid).length;
  const paidCount = events.filter(e => e.isPaid).length;

  return (
    <div className="space-y-6">
      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {SHOW_ENGAGEMENT_ANALYTICS ? (
          <>
            <OrganizerStatCard
              icon={TrendingUp}
              label="Conversion Rate"
              value={`${conversionRate}%`}
              sub="Views to registrations"
              color="indigo"
            />
            <OrganizerStatCard
              icon={Eye}
              label="Total Event Views"
              value={totalViews}
              sub="Across all live events"
              color="blue"
            />
            <OrganizerStatCard
              icon={Users}
              label="Total Registrations"
              value={totalRegs}
              sub="Verified student signups"
              color="emerald"
            />
            <OrganizerStatCard
              icon={Trophy}
              label="Total Prize Pool"
              value={totalPrizePool > 0 ? `₹${totalPrizePool.toLocaleString('en-IN')}` : '—'}
              sub="Cash awards offered"
              color="amber"
            />
          </>
        ) : (
          <>
            <OrganizerStatCard
              icon={CalendarDays}
              label="Total Events"
              value={events.length}
              sub="Submitted campus events"
              color="indigo"
            />
            <OrganizerStatCard
              icon={CheckCircle2}
              label="Live Events"
              value={events.filter(e => e.status === 'approved').length}
              sub="Published on FestNest"
              color="emerald"
            />
            <OrganizerStatCard
              icon={Clock}
              label="Under Review"
              value={events.filter(e => e.status === 'pending').length}
              sub="In review queue"
              color="amber"
            />
            <OrganizerStatCard
              icon={Trophy}
              label="Total Prize Pool"
              value={totalPrizePool > 0 ? `₹${totalPrizePool.toLocaleString('en-IN')}` : '—'}
              sub="Cash awards offered"
              color="purple"
            />
          </>
        )}
      </div>

      {/* ── Visual Charts Section ── */}
      {SHOW_ENGAGEMENT_ANALYTICS ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Engagement per Event (2 cols) */}
            <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col">
              <div className="mb-4">
                <h3 className="font-heading font-bold text-[15px] text-text-1">Engagement per Event</h3>
                <p className="text-[12px] text-text-3">Comparing views and attendee registrations across submissions</p>
              </div>

              <div className="flex-1 min-h-[260px]">
                {eventEngagementData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={eventEngagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <BarChart3 size={32} className="text-text-4 mb-2" />
                    <div className="font-heading text-[14px] font-bold text-text-2">No event analytics recorded</div>
                    <div className="text-[12px] text-text-4 mt-0.5">Post an event to begin recording student views</div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown (1 col) */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col">
              <div className="mb-3">
                <h3 className="font-heading font-bold text-[15px] text-text-1">Category Distribution</h3>
                <p className="text-[12px] text-text-3">Breakdown of events by type</p>
              </div>

              {categoryData.length > 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          innerRadius={40}
                          paddingAngle={3}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #E4E4E0',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full space-y-1.5 mt-2">
                    {categoryData.map((cat, i) => (
                      <div key={cat.name} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                          />
                          <span className="text-text-2 truncate">{cat.name}</span>
                        </div>
                        <span className="font-mono font-semibold text-text-1">{cat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-surface-1 rounded-xl border border-dashed border-border">
                  <PieIcon size={24} className="text-text-4 mb-1" />
                  <div className="text-[12px] text-text-4">No categories recorded yet</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Highlights & Insights Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topEvent && (
              <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
                    <Award size={15} />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Top Performing Event
                  </span>
                </div>

                <h4 className="font-heading font-bold text-[18px] text-text-1 leading-snug">
                  {topEvent.eventName}
                </h4>
                <p className="text-[12px] text-text-3 mt-0.5">{topEvent.college}</p>

                <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-indigo-200/60">
                  <div>
                    <div className="font-mono text-[16px] font-bold text-text-1">
                      {topEvent.linkedEvent?.stats?.viewCount || 0}
                    </div>
                    <div className="text-[10px] text-text-4 uppercase tracking-wider">Views</div>
                  </div>
                  <div>
                    <div className="font-mono text-[16px] font-bold text-primary">
                      {topEvent.linkedEvent?.stats?.registrationCount || topEvent.registrationCount || 0}
                    </div>
                    <div className="text-[10px] text-text-4 uppercase tracking-wider">Registrations</div>
                  </div>
                  <div>
                    <div className="font-mono text-[16px] font-bold text-emerald-700">
                      {topEvent.isPaid ? `₹${topEvent.entryFee}` : 'Free'}
                    </div>
                    <div className="text-[10px] text-text-4 uppercase tracking-wider">Entry</div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing & Free vs Paid Model */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <IndianRupee size={15} />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Pricing Structure
                  </span>
                </div>
                <h4 className="font-heading font-bold text-[16px] text-text-1">
                  Event Monetization Ratio
                </h4>
                <p className="text-[12px] text-text-3 mt-1">
                  Events offering free registrations tend to attract 3.4× more initial sign-ups.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-3">
                <div className="bg-surface-1 p-3 rounded-xl border border-border">
                  <div className="font-mono text-[18px] font-bold text-emerald-700">{freeCount}</div>
                  <div className="text-[11px] text-text-3 mt-0.5">Free Events</div>
                </div>
                <div className="bg-surface-1 p-3 rounded-xl border border-border">
                  <div className="font-mono text-[18px] font-bold text-text-1">{paidCount}</div>
                  <div className="text-[11px] text-text-3 mt-0.5">Paid Entry Events</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Symmetrical 2-Column Catalog Distribution & Pricing View when engagement analytics are hidden */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Distribution (Col 1) */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col">
              <div className="mb-3">
                <h3 className="font-heading font-bold text-[15px] text-text-1">Category Distribution</h3>
                <p className="text-[12px] text-text-3">Breakdown of your campus events by category</p>
              </div>

              {categoryData.length > 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={45}
                          paddingAngle={3}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #E4E4E0',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full space-y-1.5 mt-2">
                    {categoryData.map((cat, i) => (
                      <div key={cat.name} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                          />
                          <span className="text-text-2 truncate">{cat.name}</span>
                        </div>
                        <span className="font-mono font-semibold text-text-1">{cat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-surface-1 rounded-xl border border-dashed border-border">
                  <PieIcon size={24} className="text-text-4 mb-1" />
                  <div className="text-[12px] text-text-4">No categories recorded yet</div>
                </div>
              )}
            </div>

            {/* Pricing & Free vs Paid Model (Col 2) */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <IndianRupee size={15} />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    Pricing Structure
                  </span>
                </div>
                <h4 className="font-heading font-bold text-[16px] text-text-1">
                  Event Monetization Ratio
                </h4>
                <p className="text-[12px] text-text-3 mt-1">
                  Distribution of free access vs paid entry tracks in your active catalog.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-3">
                <div className="bg-surface-1 p-3.5 rounded-xl border border-border">
                  <div className="font-mono text-[22px] font-bold text-emerald-700">{freeCount}</div>
                  <div className="text-[12px] font-medium text-text-2 mt-0.5">Free Entry Events</div>
                  <div className="text-[11px] text-text-4 mt-0.5">Open campus access</div>
                </div>
                <div className="bg-surface-1 p-3.5 rounded-xl border border-border">
                  <div className="font-mono text-[22px] font-bold text-text-1">{paidCount}</div>
                  <div className="text-[12px] font-medium text-text-2 mt-0.5">Paid Entry Events</div>
                  <div className="text-[11px] text-text-4 mt-0.5">Ticketed / fee tracks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Spotlight */}
          {topEvent && (
            <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
                  <Award size={15} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Featured Event Spotlight
                </span>
              </div>

              <h4 className="font-heading font-bold text-[18px] text-text-1 leading-snug">
                {topEvent.eventName}
              </h4>
              <p className="text-[12px] text-text-3 mt-0.5">{topEvent.college}</p>

              <div className="grid grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-indigo-200/60">
                <div>
                  <div className="font-bold text-[13px] text-text-1">
                    {topEvent.eventType || 'Event'}
                  </div>
                  <div className="text-[10px] text-text-4 uppercase tracking-wider">Category</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-[13px] text-emerald-700">
                    {topEvent.isPaid ? `₹${topEvent.entryFee}` : 'Free Entry'}
                  </div>
                  <div className="text-[10px] text-text-4 uppercase tracking-wider">Entry Model</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-[13px] text-primary capitalize">
                    {topEvent.status || 'Active'}
                  </div>
                  <div className="text-[10px] text-text-4 uppercase tracking-wider">Status</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

