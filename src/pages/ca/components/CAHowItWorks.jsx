// src/pages/ca/components/CAHowItWorks.jsx
import React from 'react';
import { Send, CheckCircle2, Share2, Award, TrendingUp, Trophy } from 'lucide-react';

export default function CAHowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Apply',
      desc: 'Tell us about yourself and your campus involvement — takes under five minutes.',
      icon: Send,
    },
    {
      num: '02',
      title: 'Get Selected',
      desc: 'Once approved, receive your official CA ID, referral link/code, and portal access.',
      icon: CheckCircle2,
    },
    {
      num: '03',
      title: 'Start Sharing',
      desc: 'Use your personal links and templates to onboard students, clubs, and organizers.',
      icon: Share2,
    },
    {
      num: '04',
      title: 'Earn Points',
      desc: 'Verified signups and approved events automatically advance your performance score.',
      icon: Award,
    },
    {
      num: '05',
      title: 'Climb Leaderboard',
      desc: 'Compete against ambassadors from top campuses based strictly on verified impact.',
      icon: TrendingUp,
    },
    {
      num: '06',
      title: 'Earn Rewards',
      desc: 'Eligible top performers win monthly cash prizes and final program rewards.',
      icon: Trophy,
    },
  ];

  return (
    <section id="how" className="py-16 bg-white border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
            The Ambassador Journey
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            How It Works
          </h2>
          <p className="font-sans text-sm sm:text-base text-text-2 mt-2">
            A clear six-step progression from application to performance recognition.
          </p>
        </div>

        {/* 6 Progression Cards in a visual journey flow */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-border bg-surface-2/40 p-6 hover:bg-white hover:shadow-1 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-bold text-primary">
                    {step.num}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon size={18} />
                  </div>
                </div>

                <h3 className="font-heading text-base font-bold text-slate-900 mt-4">
                  {step.title}
                </h3>
                <p className="font-sans text-xs sm:text-sm text-text-2 mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 text-[11px] font-mono text-text-3">
                Step {step.num} of 06
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

