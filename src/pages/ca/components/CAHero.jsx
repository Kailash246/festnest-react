// src/pages/ca/components/CAHero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Trophy, ShieldCheck, Award, Gift, Compass } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CAHero({ existingCA }) {
  const isApproved = existingCA?.status === 'approved';

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-border/80 bg-gradient-to-b from-surface-2/60 via-white to-white">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute top-20 -left-20 h-80 w-80 rounded-full bg-[#8456B6]/5 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles size={13} />
              <span>Campus Ambassador Program {CA_PROGRAM_CONFIG.cohortYear}</span>
            </div>

            <h1 className="font-heading mt-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]">
              Represent FestNest on Your Campus. Drive Growth. Earn Cash Rewards.
            </h1>

            <p className="font-sans mt-4 max-w-xl text-base sm:text-lg text-text-2 leading-relaxed">
              Join 60 ambitious student leaders representing FestNest across India. Onboard college clubs &amp; events, unlock your verified CA ID &amp; certificate, and compete for performance cash rewards.
            </p>

            {/* Opportunity Metric Highlights */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6 border-y border-border py-4">
              <div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                  {CA_PROGRAM_CONFIG.totalRewardPoolDisplay}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-3 font-mono mt-0.5">
                  Reward Pool
                </div>
              </div>

              <div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                  {CA_PROGRAM_CONFIG.totalPositions}
                </div>
                <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-3 font-mono mt-0.5">
                  CA Positions
                </div>
              </div>

              <div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-slate-900">
                  6 Mo
                </div>
                <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-text-3 font-mono mt-0.5">
                  Cohort Cycle
                </div>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-text-4 font-mono">
              {CA_PROGRAM_CONFIG.rewardPoolFootnote}
            </p>

            {/* High-Conversion CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {isApproved ? (
                <Link
                  to="/ca/portal"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-indigo transition active:scale-[0.98]"
                >
                  <span>Open Your CA Portal</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  to="/campus-ambassador/apply"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-indigo transition active:scale-[0.98]"
                >
                  <span>Apply for Cohort (60 Seats)</span>
                  <ArrowRight size={16} />
                </Link>
              )}

              <Link
                to="/campus-ambassador/rewards"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-800 hover:text-slate-900 hover:bg-surface-2 transition"
              >
                <Gift size={15} className="text-primary" />
                <span>Rewards &amp; Payouts</span>
              </Link>

              <Link
                to="/campus-ambassador/how-it-works"
                className="inline-flex items-center gap-1.5 px-3 py-3 text-xs font-semibold text-primary hover:underline ml-1"
              >
                <Compass size={14} />
                <span>How It Works</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Opportunity Scorecard Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2 relative">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold font-mono">
                    CA
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading font-bold text-slate-900 text-sm">FestNest Ambassador Hub</span>
                      <ShieldCheck size={14} className="text-primary" />
                    </div>
                    <span className="font-sans text-xs text-text-3">Campus Performance Scorecard</span>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
                  VERIFIED PROGRAM
                </span>
              </div>

              {/* Performance Metrics Snapshot */}
              <div className="my-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-surface-2 p-4 border border-border/80">
                  <span className="text-[10px] uppercase font-mono font-semibold text-text-3">Monthly Top Prize</span>
                  <div className="font-mono text-2xl font-bold text-primary mt-1">₹1,500</div>
                  <span className="text-[11px] text-text-2 font-mono mt-0.5 block">1st Rank Payout</span>
                </div>

                <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80">
                  <span className="text-[10px] uppercase font-mono font-semibold text-amber-800">Grand Finale Champion</span>
                  <div className="font-mono text-2xl font-bold text-amber-700 mt-1">₹8,000</div>
                  <span className="text-[11px] text-amber-800 font-mono mt-0.5 block">Cohort Top Reward</span>
                </div>
              </div>

              {/* Milestone Tracker Highlights */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award size={15} className="text-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Official Certificate</span>
                  </div>
                  <span className="font-mono font-bold text-[11px] text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-md">
                    Unlocked at 40 Pts
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy size={15} className="text-amber-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Cash Reward Eligibility</span>
                  </div>
                  <span className="font-mono font-bold text-[11px] text-amber-800 bg-white border border-amber-200 px-2 py-0.5 rounded-md">
                    100 Pts + 4 Criteria
                  </span>
                </div>
              </div>

              {/* Day One Guarantee Strip */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-text-3 font-mono">
                <span>Base Benefits granted on day one</span>
                <Link to="/campus-ambassador/benefits" className="text-primary font-bold hover:underline">
                  View Benefits →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
