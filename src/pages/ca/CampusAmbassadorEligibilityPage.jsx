// src/pages/ca/CampusAmbassadorEligibilityPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Users, Calendar, Building, CheckCircle2, XCircle, AlertCircle, ArrowRight, Trophy, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ca } from '../../services/api';
import CANavHeader from './components/CANavHeader';
import CAEligibility from './components/CAEligibility';
import CAFinalCTA from './components/CAFinalCTA';
import CAFooter from './components/CAFooter';
import { CA_PROGRAM_CONFIG } from './config/caProgramConfig';

export default function CampusAmbassadorEligibilityPage() {
  const { isLoggedIn } = useApp();
  const [existingCA, setExistingCA] = useState(null);

  // Interactive Simulator State
  const [points, setPoints] = useState(105);
  const [users, setUsers] = useState(42);
  const [events, setEvents] = useState(2);
  const [organizers, setOrganizers] = useState(1);

  const meetsPoints = points >= CA_PROGRAM_CONFIG.milestones.rewardPoints;
  const meetsUsers = users >= CA_PROGRAM_CONFIG.milestones.rewardUsers;
  const meetsEvents = events >= CA_PROGRAM_CONFIG.milestones.rewardEvents;
  const meetsOrganizers = organizers >= CA_PROGRAM_CONFIG.milestones.rewardOrganizers;

  const passedCount = [meetsPoints, meetsUsers, meetsEvents, meetsOrganizers].filter(Boolean).length;
  const isFullyEligible = passedCount === 4;

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
              <ShieldCheck size={14} className="text-primary" />
              <span>Reward Eligibility Standards</span>
            </div>

            <h1 className="font-heading mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Minimum Reward Eligibility
            </h1>

            <p className="font-sans mt-4 max-w-2xl mx-auto text-base sm:text-lg text-text-2 leading-relaxed">
              Every CA receives base benefits upon onboarding. However, cash rewards are reserved for active ambassadors who meet <strong className="text-slate-900">all 4 non-negotiable criteria</strong>.
            </p>
          </div>
        </section>

        {/* The 4 Criteria Deep Dive */}
        <CAEligibility />

        {/* Interactive Eligibility Simulator */}
        <section className="py-16 bg-surface-2/40 border-b border-border">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
                <ShieldCheck size={14} />
                <span>INTERACTIVE SIMULATOR</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Test Your Eligibility
              </h2>
              <p className="font-sans text-xs sm:text-sm text-text-2 mt-1.5">
                Adjust the numbers to simulate whether a hypothetical performance record satisfies the mandatory criteria.
              </p>
            </div>

            {/* Simulator Box */}
            <div className="mt-8 rounded-3xl border-2 border-border bg-white p-6 sm:p-8 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {/* Criterion 1 */}
                <div className={`p-4 rounded-2xl border-2 transition ${meetsPoints ? 'border-emerald-300 bg-emerald-50/30' : 'border-border bg-surface-2/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading text-xs font-bold text-slate-900">1. Total Points</span>
                    {meetsPoints ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-amber-500" />}
                  </div>
                  <div className="font-mono text-2xl font-bold text-slate-900">{points}</div>
                  <span className="text-[10px] font-mono text-text-3 block mt-0.5">Need 100+ points</span>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                    className="w-full mt-3 accent-primary h-1.5 bg-slate-200 rounded"
                  />
                </div>

                {/* Criterion 2 */}
                <div className={`p-4 rounded-2xl border-2 transition ${meetsUsers ? 'border-emerald-300 bg-emerald-50/30' : 'border-border bg-surface-2/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading text-xs font-bold text-slate-900">2. Verified Users</span>
                    {meetsUsers ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-amber-500" />}
                  </div>
                  <div className="font-mono text-2xl font-bold text-slate-900">{users}</div>
                  <span className="text-[10px] font-mono text-text-3 block mt-0.5">Need 40+ students</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="2"
                    value={users}
                    onChange={(e) => setUsers(parseInt(e.target.value))}
                    className="w-full mt-3 accent-primary h-1.5 bg-slate-200 rounded"
                  />
                </div>

                {/* Criterion 3 */}
                <div className={`p-4 rounded-2xl border-2 transition ${meetsEvents ? 'border-emerald-300 bg-emerald-50/30' : 'border-border bg-surface-2/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading text-xs font-bold text-slate-900">3. Approved Events</span>
                    {meetsEvents ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-amber-500" />}
                  </div>
                  <div className="font-mono text-2xl font-bold text-slate-900">{events}</div>
                  <span className="text-[10px] font-mono text-text-3 block mt-0.5">Need 2+ events</span>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="1"
                    value={events}
                    onChange={(e) => setEvents(parseInt(e.target.value))}
                    className="w-full mt-3 accent-primary h-1.5 bg-slate-200 rounded"
                  />
                </div>

                {/* Criterion 4 */}
                <div className={`p-4 rounded-2xl border-2 transition ${meetsOrganizers ? 'border-emerald-300 bg-emerald-50/30' : 'border-border bg-surface-2/40'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading text-xs font-bold text-slate-900">4. Organizers</span>
                    {meetsOrganizers ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-amber-500" />}
                  </div>
                  <div className="font-mono text-2xl font-bold text-slate-900">{organizers}</div>
                  <span className="text-[10px] font-mono text-text-3 block mt-0.5">Need 1+ organizer</span>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={organizers}
                    onChange={(e) => setOrganizers(parseInt(e.target.value))}
                    className="w-full mt-3 accent-primary h-1.5 bg-slate-200 rounded"
                  />
                </div>

              </div>

              {/* Status Verdict Banner */}
              <div className={`mt-8 p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isFullyEligible
                  ? 'border-emerald-400 bg-emerald-50/80 text-emerald-950'
                  : 'border-amber-300 bg-amber-50/80 text-amber-950'
              }`}>
                <div className="flex items-center gap-3">
                  {isFullyEligible ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <CheckCircle2 size={22} />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                      <AlertCircle size={22} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-heading font-bold text-base">
                      {isFullyEligible
                        ? 'All 4 Minimum Eligibility Criteria Met!'
                        : `Partially Complete: ${passedCount} of 4 Criteria Met`}
                    </h4>
                    <p className="font-sans text-xs mt-0.5 opacity-90">
                      {isFullyEligible
                        ? 'This ambassador is officially eligible for monthly and finale cash payouts when ranking on the leaderboard.'
                        : 'Cash reward payouts require meeting ALL 4 conditions simultaneously.'}
                    </p>
                  </div>
                </div>

                <Link
                  to="/campus-ambassador/rewards"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-800 border border-slate-300 hover:bg-slate-50 transition"
                >
                  <span>Explore Rewards</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Critical Policy Note */}
            <div className="mt-8 rounded-2xl border border-border bg-white p-5 text-xs text-text-2 space-y-2 font-sans">
              <h5 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle size={15} className="text-primary" />
                <span>Does meeting eligibility guarantee a cash payout?</span>
              </h5>
              <p>
                No. Meeting the eligibility requirements qualifies you for reward payouts. The actual distribution of cash prizes is decided strictly by your position on the leaderboard:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-slate-700">
                <li><strong>Monthly Rewards:</strong> Awarded to the Top 3 eligible ambassadors each calendar month.</li>
                <li><strong>Grand Finale Rewards:</strong> Awarded to the Top 10 eligible ambassadors at the end of the 6-month cohort.</li>
              </ul>
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

