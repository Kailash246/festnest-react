// src/pages/ca/CampusAmbassadorHowItWorksPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Users, Building, Sparkles, Calculator, CheckCircle2, ArrowRight, AlertCircle, Trophy, Award, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ca } from '../../services/api';
import CANavHeader from './components/CANavHeader';
import CAHowItWorks from './components/CAHowItWorks';
import CAPointSystem from './components/CAPointSystem';
import CAFinalCTA from './components/CAFinalCTA';
import CAFooter from './components/CAFooter';
import { CA_PROGRAM_CONFIG } from './config/caProgramConfig';

export default function CampusAmbassadorHowItWorksPage() {
  const { isLoggedIn } = useApp();
  const [existingCA, setExistingCA] = useState(null);

  // Interactive Calculator State
  const [students, setStudents] = useState(45);
  const [organizers, setOrganizers] = useState(2);
  const [organizersWithEvents, setOrganizersWithEvents] = useState(2);

  // Keep organizersWithEvents <= organizers
  const handleOrganizersChange = (val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setOrganizers(num);
    if (organizersWithEvents > num) {
      setOrganizersWithEvents(num);
    }
  };

  const handleOrgWithEventsChange = (val) => {
    const num = Math.min(organizers, Math.max(0, parseInt(val) || 0));
    setOrganizersWithEvents(num);
  };

  // Calculation:
  // students * 1
  // organizers * 5
  // organizersWithEvents * 5 extra (yielding 10 total per organizer with event)
  const studentPts = students * CA_PROGRAM_CONFIG.points.userSignup;
  const organizerPts = organizers * CA_PROGRAM_CONFIG.points.organizerOnboarded;
  const firstEventBonusPts = organizersWithEvents * 5;
  const totalPoints = studentPts + organizerPts + firstEventBonusPts;

  // Criteria checks for 100-pt reward eligibility
  const meetsPoints = totalPoints >= CA_PROGRAM_CONFIG.milestones.rewardPoints;
  const meetsUsers = students >= CA_PROGRAM_CONFIG.milestones.rewardUsers;
  const meetsEvents = organizersWithEvents >= CA_PROGRAM_CONFIG.milestones.rewardEvents;
  const meetsOrganizers = organizers >= CA_PROGRAM_CONFIG.milestones.rewardOrganizers;
  const meetsAllRewardCriteria = meetsPoints && meetsUsers && meetsEvents && meetsOrganizers;

  // Milestone checks
  const meetsCertificate = totalPoints >= CA_PROGRAM_CONFIG.milestones.certificatePoints;
  const certProgress = Math.min(100, Math.round((totalPoints / CA_PROGRAM_CONFIG.milestones.certificatePoints) * 100));

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
              <Compass size={14} className="text-primary" />
              <span>Journey &amp; Scoring Engine</span>
            </div>

            <h1 className="font-heading mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
              How the CA Program Works
            </h1>

            <p className="font-sans mt-4 max-w-2xl mx-auto text-base sm:text-lg text-text-2 leading-relaxed">
              From day-one onboarding to transparent point conversion and leaderboard advancement. Learn the exact rules and simulate your score below.
            </p>
          </div>
        </section>

        {/* 6-Step Fast Journey */}
        <CAHowItWorks />

        {/* Transparent Point Conversion System */}
        <CAPointSystem />

        {/* Interactive Potential Score Calculator Section */}
        <section id="calculator" className="py-16 bg-white border-b border-border scroll-mt-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary">
                <Calculator size={14} />
                <span>INTERACTIVE TOOL</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Potential Score Calculator
              </h2>
              <p className="font-sans text-xs sm:text-sm text-text-2 mt-1.5">
                Simulate student signups and organizer onboardings to forecast your verified points and milestones.
              </p>
            </div>

            {/* Calculator Card */}
            <div className="mt-10 rounded-3xl border-2 border-border bg-surface-2/40 p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">

                {/* Left Controls (Inputs & Sliders) */}
                <div className="lg:col-span-7 space-y-6">

                  {/* Input 1: Student Referrals */}
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Users size={16} />
                        </div>
                        <div>
                          <label className="font-heading text-xs sm:text-sm font-bold text-slate-900 block">
                            Verified Students
                          </label>
                          <span className="text-[10px] text-text-3 font-mono block">
                            +1 point per verified student signup
                          </span>
                        </div>
                      </div>
                      <div className="font-mono text-base sm:text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl">
                        {students} users
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="5"
                      value={students}
                      onChange={(e) => setStudents(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-text-3 mt-1.5">
                      <span>0 users</span>
                      <span>40 users (Eligible)</span>
                      <span>150+ users</span>
                    </div>
                  </div>

                  {/* Input 2: Verified Organizers */}
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                          <Building size={16} />
                        </div>
                        <div>
                          <label className="font-heading text-xs sm:text-sm font-bold text-slate-900 block">
                            Verified Organizers Onboarded
                          </label>
                          <span className="text-[10px] text-text-3 font-mono block">
                            +5 points upon organizer verification
                          </span>
                        </div>
                      </div>
                      <div className="font-mono text-base sm:text-lg font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
                        {organizers} clubs
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={organizers}
                      onChange={(e) => handleOrganizersChange(e.target.value)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mt-2"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-text-3 mt-1.5">
                      <span>0 clubs</span>
                      <span>1 club (Eligible)</span>
                      <span>10 clubs</span>
                    </div>
                  </div>

                  {/* Input 3: First Approved Events */}
                  <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <label className="font-heading text-xs sm:text-sm font-bold text-slate-900 block">
                            Organizers Publishing First Approved Event
                          </label>
                          <span className="text-[10px] text-text-3 font-mono block">
                            +5 bonus points (+10 total for organizer + event)
                          </span>
                        </div>
                      </div>
                      <div className="font-mono text-base sm:text-lg font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl">
                        {organizersWithEvents} events
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={organizers || 1}
                      step="1"
                      value={organizersWithEvents}
                      disabled={organizers === 0}
                      onChange={(e) => handleOrgWithEventsChange(e.target.value)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600 mt-2 disabled:opacity-40"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-text-3 mt-1.5">
                      <span>0 events</span>
                      <span>2 events (Eligible)</span>
                      <span>Max: {organizers} (from onboarded)</span>
                    </div>
                  </div>

                </div>

                {/* Right Output: Score Forecast Card */}
                <div className="lg:col-span-5 rounded-3xl border-2 border-primary/30 bg-white p-6 sm:p-7 shadow-indigo flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-xs uppercase font-mono font-bold text-text-3">
                        Total Projected Score
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        LIVE FORMULA
                      </span>
                    </div>

                    <div className="mt-4 text-center">
                      <div className="font-mono text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                        {totalPoints}
                      </div>
                      <div className="font-heading text-xs font-bold uppercase tracking-wider text-primary mt-1">
                        Verified Points
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="mt-5 space-y-1.5 text-xs font-mono text-text-2 bg-surface-2 p-3.5 rounded-xl border border-border">
                      <div className="flex justify-between">
                        <span>{students} users × 1 pt:</span>
                        <span className="font-bold text-slate-900">{studentPts} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{organizers} organizers × 5 pts:</span>
                        <span className="font-bold text-slate-900">{organizerPts} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{organizersWithEvents} 1st event upgrades × 5 pts:</span>
                        <span className="font-bold text-slate-900">+{firstEventBonusPts} pts</span>
                      </div>
                    </div>

                    {/* Milestone 1: Certificate (40 pts) */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-heading font-bold text-slate-900 flex items-center gap-1.5">
                          <Award size={14} className="text-indigo-600" />
                          <span>40 Pts Certificate Milestone</span>
                        </span>
                        <span className={`font-mono font-bold text-xs ${meetsCertificate ? 'text-emerald-700' : 'text-slate-500'}`}>
                          {meetsCertificate ? 'UNLOCKED' : `${40 - totalPoints} pts to go`}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${meetsCertificate ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${certProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Milestone 2: Reward Eligibility (All 4 Criteria) */}
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-heading font-bold text-slate-900 flex items-center gap-1.5">
                          <Trophy size={14} className="text-amber-500" />
                          <span>Reward Eligibility (4 Criteria)</span>
                        </span>
                        <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${
                          meetsAllRewardCriteria
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {meetsAllRewardCriteria ? 'QUALIFIED' : 'PENDING'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                        <div className={`p-1.5 rounded-lg flex items-center gap-1.5 ${meetsPoints ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}>
                          <CheckCircle2 size={12} className={meetsPoints ? 'text-emerald-600' : 'text-slate-400'} />
                          <span>100+ Pts ({totalPoints})</span>
                        </div>
                        <div className={`p-1.5 rounded-lg flex items-center gap-1.5 ${meetsUsers ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}>
                          <CheckCircle2 size={12} className={meetsUsers ? 'text-emerald-600' : 'text-slate-400'} />
                          <span>40+ Users ({students})</span>
                        </div>
                        <div className={`p-1.5 rounded-lg flex items-center gap-1.5 ${meetsEvents ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}>
                          <CheckCircle2 size={12} className={meetsEvents ? 'text-emerald-600' : 'text-slate-400'} />
                          <span>2+ Events ({organizersWithEvents})</span>
                        </div>
                        <div className={`p-1.5 rounded-lg flex items-center gap-1.5 ${meetsOrganizers ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}>
                          <CheckCircle2 size={12} className={meetsOrganizers ? 'text-emerald-600' : 'text-slate-400'} />
                          <span>1+ Org ({organizers})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      to="/campus-ambassador/apply"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-indigo transition active:scale-[0.98]"
                    >
                      <span>Start Earning: Apply Now</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

              </div>
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

