// src/pages/ca/components/CAPointSystem.jsx
import React from 'react';
import { Users, Building, Sparkles, Check, ArrowRight } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CAPointSystem() {
  return (
    <section className="py-16 bg-surface-2/40 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
            Point Conversion Model
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            How you earn points
          </h2>
          <p className="font-sans text-sm sm:text-base text-text-2 mt-2 leading-relaxed">
            Points are earned through verified student registrations and student organizer onboardings on your campus.
          </p>
        </div>

        {/* 3 Core Point Conversion Blocks */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">

          {/* Block 1: Verified Student */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Users size={20} />
                </div>
                <span className="font-mono text-xl font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  +1 pt
                </span>
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900 mt-4">
                Verified Student / User
              </h3>
              <p className="font-sans text-xs text-text-2 mt-1.5 leading-relaxed">
                When a student signs up on FestNest using your referral link or enters your ambassador code during registration.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-mono text-text-3">
              Applies to verified student signups
            </div>
          </div>

          {/* Block 2: Verified Organizer */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Building size={20} />
                </div>
                <span className="font-mono text-xl font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                  +5 pts
                </span>
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900 mt-4">
                Verified Organizer
              </h3>
              <p className="font-sans text-xs text-text-2 mt-1.5 leading-relaxed">
                When a campus club, student council, or event organizer signs up through your organizer onboarding link.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-mono text-text-3">
              Initial organizer onboarding
            </div>
          </div>

          {/* Block 3: Organizer + First Approved Event */}
          <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-b from-indigo-50/60 to-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-indigo">
                  <Sparkles size={20} />
                </div>
                <span className="font-mono text-xl font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                  10 pts TOTAL
                </span>
              </div>
              <h3 className="font-heading text-base font-bold text-slate-900 mt-4">
                Organizer + First Approved Event
              </h3>
              <p className="font-sans text-xs text-text-2 mt-1.5 leading-relaxed">
                Bringing an organizer earns 5 points. When that organizer successfully publishes their first approved event, the organizer conversion is <strong className="text-slate-900">upgraded to 10 points total</strong>.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-primary/20 text-[11px] font-mono text-primary font-semibold">
              Total 10 pts per organizer with event
            </div>
          </div>

        </div>

        {/* Visual Example Card */}
        <div className="mt-8 rounded-2xl border border-border bg-white p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase font-mono font-bold text-primary">Calculation Example</span>
              <h4 className="font-heading text-lg font-bold text-slate-900 mt-0.5">
                How an ambassador reaches 80 points
              </h4>
              <p className="font-sans text-xs sm:text-sm text-text-2 mt-1">
                Approved events also count toward satisfying the 2+ approved events minimum eligibility criteria.
              </p>
            </div>

            {/* Visual Formula */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-surface-2 p-3 sm:p-4 rounded-xl border border-border font-mono text-xs sm:text-sm">
              <div className="px-3 py-1.5 rounded-lg bg-white border border-border">
                <span className="font-bold text-slate-900">60 verified users</span>
                <span className="text-text-3 ml-1">(60 pts)</span>
              </div>
              <span className="text-slate-400 font-bold">+</span>
              <div className="px-3 py-1.5 rounded-lg bg-white border border-border">
                <span className="font-bold text-slate-900">2 organizers with approved events</span>
                <span className="text-text-3 ml-1">(2 × 10 = 20 pts)</span>
              </div>
              <span className="text-primary font-bold">=</span>
              <div className="px-3.5 py-1.5 rounded-lg bg-primary text-white font-bold shadow-sm">
                80 points
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

