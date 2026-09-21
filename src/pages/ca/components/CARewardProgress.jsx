// src/pages/ca/components/CARewardProgress.jsx
import React from 'react';
import { CheckCircle2, XCircle, Award, Target, Sparkles } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CARewardProgress({ performance }) {
  const { milestones } = CA_PROGRAM_CONFIG;

  const checklist = [
    {
      label: `${milestones.rewardUsers}+ Verified Users`,
      current: `${performance.verifiedUsers} users`,
      met: performance.hasUsers,
    },
    {
      label: `${milestones.rewardEvents}+ Approved Events`,
      current: `${performance.approvedEvents} events`,
      met: performance.hasEvents,
    },
    {
      label: `${milestones.rewardOrganizers}+ Verified Organizer`,
      current: `${performance.verifiedOrganizers} organizer`,
      met: performance.hasOrganizers,
    },
    {
      label: `${milestones.rewardPoints}+ Verified Points`,
      current: `${performance.totalPoints} points`,
      met: performance.hasPoints,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="font-mono text-xs font-semibold text-text-3 uppercase tracking-wider">
            Cash Reward Threshold
          </span>
          <h3 className="font-heading text-lg font-bold text-slate-900 mt-0.5">
            Reward Eligibility Progress
          </h3>
        </div>

        <div className="sm:text-right">
          <span className="font-mono text-xs font-bold text-primary">
            {performance.totalPoints} / {milestones.rewardPoints} POINTS
          </span>
          <p className="text-xs text-text-3 mt-0.5">
            {performance.isEligible
              ? 'All 4 conditions satisfied!'
              : `${performance.rewardPointsRemaining} points remaining to 100 pts`}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-surface-3 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            performance.isEligible
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-primary to-[#8456B6]'
          }`}
          style={{ width: `${performance.rewardProgressPct}%` }}
        />
      </div>

      {/* Dynamic Status Callout Banner */}
      <div className={`mt-5 p-3.5 rounded-xl border flex items-center justify-between text-xs ${
        performance.isEligible
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold'
          : 'bg-indigo-50/70 border-indigo-100 text-indigo-950'
      }`}>
        <div className="flex items-center gap-2">
          {performance.isEligible ? (
            <Sparkles size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <Target size={16} className="text-primary shrink-0" />
          )}
          <span>
            {performance.isEligible
              ? '🎉 Reward Eligible — You meet all minimum criteria for performance cash rewards!'
              : `Keep going — ${performance.rewardPointsRemaining} more points needed to qualify for cash rewards.`}
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold shrink-0">
          {performance.criteriaMetCount} of 4 Met
        </span>
      </div>

      {/* 4 Eligibility Checklist Items */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        {checklist.map((item) => (
          <div
            key={item.label}
            className={`p-3 rounded-xl border flex flex-col justify-between ${
              item.met
                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                : 'bg-surface-2 border-border/80 text-text-2'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              {item.met ? (
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : (
                <XCircle size={16} className="text-slate-400" />
              )}
              <span className={`text-[10px] font-mono font-bold uppercase ${
                item.met ? 'text-emerald-700' : 'text-text-4'
              }`}>
                {item.met ? 'Satisfied' : 'Pending'}
              </span>
            </div>
            <div>
              <div className="font-heading font-semibold text-slate-900 text-xs">
                {item.label}
              </div>
              <div className="font-mono text-[11px] text-text-3 mt-0.5">
                Current: {item.current}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

