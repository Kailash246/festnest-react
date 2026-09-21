// src/pages/ca/components/CARewards.jsx
import React from 'react';
import { Trophy, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CARewards() {
  return (
    <section id="rewards" className="py-16 bg-surface-2/40 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
            Performance Rewards Structure
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            Perform. Climb. Earn.
          </h2>
          <p className="font-sans text-sm sm:text-base text-text-2 mt-2 leading-relaxed">
            Your performance determines your position on the leaderboard and your eligibility for rewards.
          </p>

          {/* Grand Pool Banner */}
          <div className="mt-6 inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-[#8456B6] px-8 py-4 text-white shadow-indigo">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-100">
              Total Performance Reward Pool
            </span>
            <span className="font-mono text-3xl sm:text-4xl font-bold mt-0.5">
              {CA_PROGRAM_CONFIG.totalRewardPoolDisplay}
            </span>
            <span className="text-[10px] text-indigo-200 mt-1 font-mono">
              ₹16,800 Monthly Payouts + ₹27,000 Final Payouts
            </span>
          </div>
        </div>

        {/* Two Columns: Monthly vs Final 6-Month Rewards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">

          {/* Monthly Rewards Card */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-slate-900">
                      Monthly Performance Rewards
                    </h3>
                    <span className="font-sans text-xs text-text-3">
                      Awarded every month across the 6-month cycle
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-primary">
                  ₹2,800 / Mo
                </span>
              </div>

              {/* Monthly Tiers */}
              <div className="mt-5 space-y-3">
                {CA_PROGRAM_CONFIG.monthlyRewards.map((item) => (
                  <div
                    key={item.rank}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2 border border-border/80 hover:bg-white hover:border-primary/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-slate-800">
                        {item.badge}
                      </span>
                    </div>
                    <span className="font-mono text-base font-bold text-slate-900">
                      {item.formatted}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-text-3 font-mono">
              Total monthly rewards pool: ₹16,800 across 6 cycles
            </div>
          </div>

          {/* Final 6-Month Cumulative Rewards Card */}
          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-slate-900">
                      Final 6-Month Rewards
                    </h3>
                    <span className="font-sans text-xs text-text-3">
                      Cumulative performance prizes for Top 10 ambassadors
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  ₹27,000 Pool
                </span>
              </div>

              {/* Final Rewards List */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {CA_PROGRAM_CONFIG.finalRewards.map((item) => (
                  <div
                    key={item.rank}
                    className="p-3 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 block">
                        {item.rank} Place
                      </span>
                      <span className="text-[10px] text-text-3 font-mono block">
                        {item.badge}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold text-amber-700">
                      {item.formatted}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-text-3 font-mono">
              Awarded at final cohort graduation based on cumulative points
            </div>
          </div>

        </div>

        {/* Clear Eligibility Warning Banner */}
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <p className="font-sans text-xs sm:text-sm text-amber-950 leading-relaxed">
            <strong>Clear Eligibility Rule:</strong> Rewards are performance-based. Meeting the minimum eligibility criteria is required before a CA can receive a performance reward. Being a CA grants access to base benefits, while cash rewards require satisfying all 4 eligibility thresholds.
          </p>
        </div>

      </div>
    </section>
  );
}

