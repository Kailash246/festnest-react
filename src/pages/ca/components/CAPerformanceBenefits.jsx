// src/pages/ca/components/CAPerformanceBenefits.jsx
import React from 'react';
import { Trophy, Award, Zap, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CAPerformanceBenefits() {
  const perfItems = [
    {
      icon: Trophy,
      title: 'Monthly Cash Rewards',
      tag: 'Monthly Payout',
      desc: 'Top 3 monthly leaderboard positions win ₹1,500 (1st), ₹800 (2nd), and ₹500 (3rd). Distributed every month based on verified stats.',
      badge: '₹2,800 / Mo Pool',
    },
    {
      icon: Zap,
      title: 'Final Program Rewards',
      tag: '6-Month Grand Pool',
      desc: 'Top 10 cumulative ambassadors share ₹27,000 in grand rewards at cohort completion, with ₹8,000 for the top performer.',
      badge: '₹27,000 Final Pool',
    },
    {
      icon: Award,
      title: 'Top Performer Recognition',
      tag: 'Platform Spotlight',
      desc: 'Stand out with verified leaderboard rankings, founder spotlight, and featured showcase across FestNest socials.',
      badge: 'Verified Rank',
    },
    {
      icon: FileSpreadsheet,
      title: 'Executive Recommendations',
      tag: 'Career Advantage',
      desc: 'Official startup letters of recommendation and personal references from the FestNest team for top performers.',
      badge: 'Top Performers Only',
    },
  ];

  return (
    <section className="py-16 bg-white border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold uppercase">
            <span>Category B: Performance-Based Rewards</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Earn More Through Performance
          </h2>
          <p className="font-sans text-sm sm:text-base text-text-2 mt-2 leading-relaxed">
            These rewards are <strong className="text-slate-900">not guaranteed simply by joining</strong>. They are unlocked when you meet all minimum eligibility criteria and compete for top leaderboard rankings.
          </p>
        </div>

        {/* 4 Performance Cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {perfItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-50/40 via-white to-white p-5 shadow-sm hover:shadow-1 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/80 text-amber-700">
                    <item.icon size={20} />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-800">
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-text-2 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-amber-800 font-semibold">
                <span>Performance-based</span>
                <span>Requires eligibility</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mandatory Transparency Callout */}
        <div className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 sm:p-5 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block mb-0.5">Important Transparency Policy:</span>
            Cash rewards are strictly performance-driven. Meeting the minimum eligibility criteria (100+ Points, 40+ Verified Users, 2+ Approved Events, 1+ Verified Organizer) is mandatory before an ambassador is eligible to receive performance payouts.
          </div>
        </div>

      </div>
    </section>
  );
}

