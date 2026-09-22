// src/pages/ca/components/CAPerformanceOverview.jsx
import React from 'react';
import { Users, Calendar, Building, Award, Trophy, Sparkles } from 'lucide-react';

export default function CAPerformanceOverview({ performance }) {
  const statCards = [
    {
      icon: Users,
      label: 'Verified Users',
      value: performance.verifiedUsers,
      sub: '+1 pt each',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Calendar,
      label: 'Approved Events',
      value: performance.approvedEvents,
      sub: 'Min 2 required for cash',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: Building,
      label: 'Verified Organizers',
      value: performance.verifiedOrganizers,
      sub: '+5 or 10 pts with event',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Award,
      label: 'Total Verified Points',
      value: performance.totalPoints,
      sub: 'Official score',
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Large Dominant Performance Block */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-text-3">
              Your Performance Score
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="font-mono text-4xl sm:text-5xl font-bold text-primary tracking-tight">
                {performance.totalPoints}
              </span>
              <span className="font-heading text-lg font-bold text-slate-700 uppercase">
                Points
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:self-center">
            <div className="rounded-xl bg-amber-50 border border-amber-200/80 px-4 py-3 text-right">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-800 block">
                Leaderboard Position
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-amber-700 mt-0.5 block">
                {performance.rank ? `#${performance.rank} THIS MONTH` : 'RANK #1'}
              </span>
            </div>

            <div className="rounded-xl bg-surface-2 border border-border px-4 py-3 text-right">
              <span className="text-[10px] font-mono font-bold uppercase text-text-3 block">
                Performance Status
              </span>
              <span className={`font-mono text-sm sm:text-base font-bold mt-0.5 block ${
                performance.isEligible ? 'text-emerald-600' : 'text-slate-800'
              }`}>
                {performance.statusLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon size={20} />
              </div>
              <span className="text-[10px] font-mono font-medium text-text-4">
                Verified
              </span>
            </div>

            <div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-slate-900">
                {card.value}
              </div>
              <div className="font-heading text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                {card.label}
              </div>
              <div className="font-mono text-[10px] sm:text-[11px] text-text-3 mt-1">
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

