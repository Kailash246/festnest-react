// src/pages/ca/components/CABaseBenefits.jsx
import React from 'react';
import { IdCard, UserCheck, Link2, LayoutDashboard, Users, Award, FileCheck, CheckCircle2 } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CABaseBenefits() {
  const baseItems = [
    {
      icon: IdCard,
      title: 'Official FestNest CA ID',
      tag: 'Verified Identity',
      desc: 'Digital credential with your official CA number, college name, and tamper-proof verification QR code.',
    },
    {
      icon: UserCheck,
      title: 'Verified CA Profile',
      tag: 'Campus Association',
      desc: 'Dedicated profile on FestNest certifying your official representation for your college community.',
    },
    {
      icon: Link2,
      title: 'Personal Referral Link & Code',
      tag: 'Attribution',
      desc: 'Unique tracking URLs for student discovery and organizer onboarding with automated credit attribution.',
    },
    {
      icon: LayoutDashboard,
      title: 'CA Portal Access',
      tag: 'Live Dashboard',
      desc: 'Full access to your personal performance hub with real-time conversion stats and leaderboard rankings.',
    },
    {
      icon: Users,
      title: 'FestNest CA Community',
      tag: 'Network',
      desc: 'Private channel to connect with ambitious student ambassadors across leading Indian college campuses.',
    },
    {
      icon: Award,
      title: 'Official CA Recognition',
      tag: 'Resume Asset',
      desc: 'Verifiable startup leadership experience to showcase on your LinkedIn, resume, and student portfolios.',
    },
  ];

  return (
    <section className="py-16 bg-surface-2/50 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold uppercase">
            <span>Category A: Base Program Benefits</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            What Every Approved CA Gets
          </h2>
          <p className="font-sans text-sm sm:text-base text-text-2 mt-2 leading-relaxed">
            Every selected Campus Ambassador receives these core benefits upon onboarding. They are <strong className="text-slate-900">never locked behind 100 points</strong> or leaderboard rank.
          </p>
        </div>

        {/* 6 Base Benefits Grid */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {baseItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-1 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon size={20} />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-surface-2 text-text-3 border border-border">
                    {item.tag}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="font-sans text-xs text-text-2 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Granted on CA approval</span>
              </div>
            </div>
          ))}
        </div>

        {/* Certificate Milestone Callout Box (40 Points) */}
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/50 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-indigo">
              <FileCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                  Program Certificate
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">
                  Participation Milestone
                </span>
              </div>
              <p className="font-sans text-xs sm:text-sm text-text-2 mt-0.5">
                <strong className="text-indigo-900 font-semibold">Certificate unlocked after reaching 40 verified points.</strong> Designed as an achievable early milestone separate from cash rewards.
              </p>
            </div>
          </div>

          <div className="shrink-0 font-mono text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-4 py-2 rounded-xl text-center">
            40 Verified Points Milestone
          </div>
        </div>

      </div>
    </section>
  );
}

