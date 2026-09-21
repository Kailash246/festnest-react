// src/pages/ca/components/CAHero.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Trophy, Users, CheckCircle2, Copy, Check, ShieldCheck, Award } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CAHero({ existingCA }) {
  const [copied, setCopied] = useState(false);
  const isApproved = existingCA?.status === 'approved';

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://festnest.in?ref=FN-CA-BLR-014');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
              Become the face of FestNest on your campus.
            </h1>

            <p className="font-sans mt-4 max-w-xl text-base sm:text-lg text-text-2 leading-relaxed">
              Get your official FestNest CA identity, build your campus network, bring events and organizers to FestNest, climb the leaderboard and compete for performance rewards.
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
                  Performance
                </div>
              </div>
            </div>

            <p className="mt-2 text-[11px] text-text-4 font-mono">
              {CA_PROGRAM_CONFIG.rewardPoolFootnote}
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {isApproved ? (
                <Link
                  to="/ca/portal"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark shadow-indigo transition active:scale-[0.98]"
                >
                  <span>Open Your CA Portal</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <a
                  href="#apply"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark shadow-indigo transition active:scale-[0.98]"
                >
                  <span>Become a Campus Ambassador</span>
                  <ArrowRight size={16} />
                </a>
              )}

              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-text-2 hover:text-slate-900 hover:bg-surface-2 transition"
              >
                <span>See How It Works</span>
              </a>

              <Link
                to="/ca/leaderboard"
                className="inline-flex items-center gap-1.5 px-3 py-3 text-xs font-semibold text-primary hover:underline ml-1"
              >
                <Trophy size={14} className="text-amber-500" />
                <span>View Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Rich Interactive Opportunity Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2 relative">
              {/* Top Bar: Identity & Verified Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold font-heading">
                    AS
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-heading font-bold text-slate-900 text-sm">Aditi Sharma</span>
                      <ShieldCheck size={14} className="text-primary" />
                    </div>
                    <span className="font-sans text-xs text-text-3">RV College of Engineering</span>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
                  ACTIVE CA
                </span>
              </div>

              {/* Performance Score & Monthly Rank */}
              <div className="my-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-2 p-3.5 border border-border/80">
                  <span className="text-[10px] uppercase font-mono font-semibold text-text-3">Performance Score</span>
                  <div className="font-mono text-2xl font-bold text-primary mt-0.5">137 PTS</div>
                  <span className="text-[11px] text-emerald-600 font-medium font-mono mt-1 block">✓ Reward Eligible</span>
                </div>

                <div className="rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/80">
                  <span className="text-[10px] uppercase font-mono font-semibold text-amber-800">Current Rank</span>
                  <div className="font-mono text-2xl font-bold text-amber-700 mt-0.5">#1 RANK</div>
                  <span className="text-[11px] text-amber-800 font-medium font-mono mt-1 block">₹1,500 Reward Track</span>
                </div>
              </div>

              {/* Referral Link Quick Copy Chip */}
              <div className="rounded-xl border border-border bg-surface-2/80 p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-text-4 uppercase block">Your Referral Link</span>
                  <span className="font-mono text-xs text-slate-700 truncate block">festnest.in?ref=FN-CA-BLR-014</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  title="Copy link"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Mini Leaderboard Preview Snapshot */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-text-2 uppercase font-mono">Monthly Leaderboard Preview</span>
                  <span className="text-[11px] text-primary font-semibold">Live Snapshot</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100 font-medium">
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary">#1</span>
                      <span className="text-slate-900 font-semibold">Aditi Sharma (RVCE)</span>
                    </span>
                    <span className="font-mono font-bold text-primary">137 pts</span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 text-text-2">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-text-3">#2</span>
                      <span>Priya Iyer (COEP)</span>
                    </span>
                    <span className="font-mono text-text-3">121 pts</span>
                  </div>

                  <div className="flex items-center justify-between py-1 px-2.5 text-text-2">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-text-3">#3</span>
                      <span>Arjun Nair (IITM)</span>
                    </span>
                    <span className="font-mono text-text-3">110 pts</span>
                  </div>
                </div>
              </div>

              {/* Milestone Indicator */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50/80 border border-emerald-200 p-2.5 text-[11px] text-emerald-800">
                <Award size={15} className="text-emerald-600 shrink-0" />
                <span>Certificate Unlocked at 40 pts • All 4 cash eligibility criteria met</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

