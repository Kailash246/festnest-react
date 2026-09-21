// src/pages/ca/components/CAProgressionLadder.jsx
import React from 'react';
import { ShieldCheck, Award, Target, Trophy, ArrowRight } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CAProgressionLadder() {
  const steps = [
    {
      stage: 'STAGE 1',
      title: 'Approved CA',
      icon: ShieldCheck,
      color: 'border-primary/30 bg-primary/5 text-primary',
      badge: 'Unlocked Onboarding',
      badgeColor: 'bg-primary/10 text-primary',
      detail: 'Official FestNest ID, Verified Profile, Personal Referral Link & Code, Portal Access, CA Community, and Official Recognition.',
      footnote: 'Zero points required • Base benefit',
    },
    {
      stage: 'STAGE 2',
      title: '40 Points',
      icon: Award,
      color: 'border-indigo-300 bg-indigo-50/50 text-indigo-700',
      badge: 'Certificate Milestone',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      detail: 'Official FestNest Campus Ambassador Certificate unlocked after reaching 40 verified participation points.',
      footnote: 'Early participation recognition',
    },
    {
      stage: 'STAGE 3',
      title: 'Reward Eligible',
      icon: Target,
      color: 'border-emerald-300 bg-emerald-50/50 text-emerald-700',
      badge: 'All 4 Criteria',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      detail: 'Meet ALL 4 conditions: 100+ Points, 40+ Verified Users, 2+ Approved Events, and 1+ Verified Organizer.',
      footnote: 'Unlocks cash reward qualification',
    },
    {
      stage: 'STAGE 4',
      title: 'Cash Rewards',
      icon: Trophy,
      color: 'border-amber-300 bg-amber-50/60 text-amber-700',
      badge: 'Leaderboard Rank',
      badgeColor: 'bg-amber-100 text-amber-900',
      detail: 'Top 3 monthly performers earn up to ₹1,500/mo. Top 10 cumulative 6-month performers earn up to ₹8,000.',
      footnote: 'Distributed based on verified rank',
    },
  ];

  return (
    <section className="py-14 border-b border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
            How The Progression Works
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            From Onboarding to Cash Rewards
          </h2>
          <p className="font-sans text-sm text-text-2 mt-2 leading-relaxed">
            Joining as an approved CA gives you immediate access to all base benefits. Performance points unlock your official certificate and cash reward eligibility.
          </p>
        </div>

        {/* 4 Connected Progression Steps */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div
              key={step.stage}
              className={`relative rounded-2xl border p-5 flex flex-col justify-between transition hover:shadow-1 ${step.color}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-text-3 uppercase">
                    {step.stage}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200/60">
                    <step.icon size={18} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>
                </div>

                <p className="mt-3 font-sans text-xs leading-relaxed text-text-2">
                  {step.detail}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 text-[11px] font-mono font-medium text-text-3">
                {step.footnote}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

