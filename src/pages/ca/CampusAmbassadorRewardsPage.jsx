// src/pages/ca/CampusAmbassadorRewardsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Sparkles, AlertCircle, ArrowRight, CheckCircle2, ChevronRight, Calculator, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ca } from '../../services/api';
import CANavHeader from './components/CANavHeader';
import CAProgressionLadder from './components/CAProgressionLadder';
import CAFinalCTA from './components/CAFinalCTA';
import CAFooter from './components/CAFooter';
import { CA_PROGRAM_CONFIG } from './config/caProgramConfig';

export default function CampusAmbassadorRewardsPage() {
  const { isLoggedIn } = useApp();
  const [existingCA, setExistingCA] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      ca.me()
        .then((res) => {
          if (res.data?.profile) setExistingCA(res.data.profile);
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  return (
    <div className="font-sans min-h-screen bg-surface text-slate-900 selection:bg-primary/15 selection:text-slate-900 flex flex-col justify-between">
      <div>
        {/* Navigation */}
        <CANavHeader existingCA={existingCA} />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-16 md:pt-14 md:pb-20 border-b border-border bg-gradient-to-b from-indigo-50/50 via-white to-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-mono font-semibold text-primary">
              <Trophy size={14} className="text-amber-500" />
              <span>Campus Ambassador Rewards Structure</span>
            </div>

            <h1 className="font-heading mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Perform. Climb. Earn Cash Rewards.
            </h1>

            <p className="font-sans mt-4 max-w-2xl mx-auto text-base sm:text-lg text-text-2 leading-relaxed">
              Every point you earn is verified and directly advances your position on the leaderboard. High-performing student ambassadors earn both monthly cash payouts and grand cohort prizes.
            </p>

            {/* Grand Pool Display Box */}
            <div className="mt-8 inline-flex flex-col items-center justify-center rounded-2xl bg-gradient-to-r from-primary via-[#6d3ab0] to-[#8456B6] px-8 py-5 text-white shadow-indigo">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-100">
                Total Performance Reward Pool
              </span>
              <span className="font-mono text-3xl sm:text-5xl font-extrabold mt-1 tracking-tight">
                {CA_PROGRAM_CONFIG.totalRewardPoolDisplay}
              </span>
              <span className="text-xs text-indigo-200 mt-1.5 font-mono">
                ₹16,800 Monthly Payouts + ₹27,000 Grand Finale Payouts
              </span>
            </div>

            <p className="mt-3 text-xs text-text-3 font-mono">
              {CA_PROGRAM_CONFIG.rewardPoolFootnote}
            </p>
          </div>
        </section>

        {/* Reward Tiers: Monthly vs Finale */}
        <section className="py-16 bg-white border-b border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2">

              {/* Card 1: Monthly Rewards */}
              <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-b from-primary/[0.02] to-white p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <h2 className="font-heading text-xl font-bold text-slate-900">
                          Monthly Performance Rewards
                        </h2>
                        <p className="text-xs text-text-3 mt-0.5 font-sans">
                          Awarded to top performers at the end of each monthly cycle
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-primary border border-indigo-100">
                      ₹2,800 / Mo
                    </span>
                  </div>

                  <div className="mt-6 space-y-3.5">
                    {CA_PROGRAM_CONFIG.monthlyRewards.map((tier) => (
                      <div
                        key={tier.rank}
                        className="flex items-center justify-between p-4 rounded-xl bg-surface-2 border border-border/80 hover:border-primary/40 hover:bg-white transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-heading font-bold text-base text-slate-900">
                            {tier.badge}
                          </span>
                          <span className="text-xs font-sans text-text-3">
                            Leaderboard Rank
                          </span>
                        </div>
                        <span className="font-mono text-lg font-bold text-primary">
                          {tier.formatted}
                          <span className="text-xs text-text-3 font-normal"> / mo</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-xl bg-surface-2 p-4 border border-border text-xs text-text-2 space-y-1.5 font-sans">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Monthly Reward Terms</span>
                    </div>
                    <p>• Runs across 6 consecutive monthly cycles totaling ₹16,800.</p>
                    <p>• Monthly scores reset at the beginning of each calendar cycle for fresh competition.</p>
                    <p>• CAs must meet monthly activity standards to qualify for payout disbursement.</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-mono text-text-3">
                  Payouts disbursed directly via UPI / Bank Transfer within 7 days of month-end.
                </div>
              </div>

              {/* Card 2: Grand Finale Rewards */}
              <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50/30 to-white p-6 sm:p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <Trophy size={22} />
                      </div>
                      <div>
                        <h2 className="font-heading text-xl font-bold text-slate-900">
                          Cohort Grand Finale Rewards
                        </h2>
                        <p className="text-xs text-text-3 mt-0.5 font-sans">
                          Cumulative 6-month prizes distributed across the Top 10 ambassadors
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      ₹27,000 Pool
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {CA_PROGRAM_CONFIG.finalRewards.map((tier) => (
                      <div
                        key={tier.rank}
                        className="p-3.5 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-between hover:bg-white hover:border-amber-300 transition"
                      >
                        <div>
                          <span className="font-heading text-xs font-bold text-slate-900 block">
                            {tier.rank} Place
                          </span>
                          <span className="text-[10px] text-text-3 font-mono block">
                            {tier.badge}
                          </span>
                        </div>
                        <span className="font-mono text-base font-bold text-amber-700">
                          {tier.formatted}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-xl bg-amber-50/60 p-4 border border-amber-200 text-xs text-amber-950 space-y-1.5 font-sans">
                    <div className="flex items-center gap-2 font-semibold text-amber-900">
                      <ShieldCheck size={14} className="text-amber-600" />
                      <span>Grand Finale Qualifications</span>
                    </div>
                    <p>• Based on all-time cumulative verified points earned throughout the 6-month cohort.</p>
                    <p>• All 4 Minimum Reward Eligibility criteria must be satisfied to receive finale cash rewards.</p>
                    <p>• Top 10 finalists also receive signed Executive Letters of Recommendation from the Founders.</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-mono text-text-3">
                  Announced at the Cohort 2025–26 Virtual Graduation Ceremony.
                </div>
              </div>

            </div>

            {/* Minimum Eligibility Alert Banner */}
            <div className="mt-10 rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-white to-primary/5 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-3.5">
                <AlertCircle size={22} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-slate-900 text-base">
                    Minimum Reward Eligibility Rules
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-text-2 mt-1 max-w-2xl leading-relaxed">
                    Being selected as a CA grants you all <strong>Base Benefits</strong> immediately. To qualify for cash rewards, an ambassador must meet all 4 minimum thresholds: <strong>100+ points, 40+ verified users, 2+ approved events, and 1+ verified organizer</strong>.
                  </p>
                </div>
              </div>

              <Link
                to="/campus-ambassador/eligibility"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-dark shadow-sm transition"
              >
                <span>View Full Criteria</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* 4-Stage Progression Ladder */}
        <CAProgressionLadder />

        {/* Interactive Points Preview Callout */}
        <section className="py-12 bg-white border-b border-border">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary mx-auto mb-3">
              <Calculator size={24} />
            </div>
            <h2 className="font-heading text-2xl font-bold text-slate-900">
              Want to see how many points your campus network can yield?
            </h2>
            <p className="font-sans text-sm text-text-2 mt-2 max-w-xl mx-auto">
              Use our interactive potential score calculator to simulate student registrations and organizer onboardings.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/campus-ambassador/how-it-works"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-indigo transition"
              >
                <span>Launch Interactive Score Calculator</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/campus-ambassador/apply"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-surface-2 transition"
              >
                <span>Apply to Cohort</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <CAFinalCTA existingCA={existingCA} />
      </div>

      {/* Footer */}
      <CAFooter />
    </div>
  );
}

