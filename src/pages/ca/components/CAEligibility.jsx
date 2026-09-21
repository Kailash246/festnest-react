// src/pages/ca/components/CAEligibility.jsx
import React from 'react';
import { CheckCircle2, ShieldAlert, Users, Calendar, Building, Award } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CAEligibility() {
  const criteria = [
    {
      icon: Award,
      target: '100+',
      label: 'Points',
      detail: 'Earned via verified students, organizers, and approved campus events',
    },
    {
      icon: Users,
      target: '40+',
      label: 'Verified Users',
      detail: 'Students who sign up on FestNest using your personal referral link or code',
    },
    {
      icon: Calendar,
      target: '2+',
      label: 'Approved Events',
      detail: 'College fests, hackathons, or workshops published & approved on FestNest',
    },
    {
      icon: Building,
      target: '1+',
      label: 'Verified Organizer',
      detail: 'Campus club, society, or department lead onboarded through your host link',
    },
  ];

  return (
    <section id="eligibility" className="py-16 bg-white border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
            Minimum Reward Eligibility
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            Want to earn? Hit the eligibility requirements.
          </h2>
          <p className="font-sans text-sm sm:text-base text-text-2 mt-2 leading-relaxed">
            To qualify for performance rewards, a Campus Ambassador must meet <span className="underline decoration-primary font-bold text-slate-900 uppercase">ALL</span> minimum eligibility requirements.
          </p>
        </div>

        {/* 4 Eligibility Threshold Boxes */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {criteria.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border-2 border-primary/20 bg-primary/[0.02] p-6 text-center hover:border-primary/50 transition flex flex-col items-center justify-between"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
                  <c.icon size={22} />
                </div>
                <div className="font-mono text-3xl sm:text-4xl font-bold text-slate-900">
                  {c.target}
                </div>
                <div className="font-heading text-sm font-bold uppercase tracking-wider text-primary mt-1">
                  {c.label}
                </div>
                <p className="font-sans text-xs text-text-3 mt-2 leading-relaxed">
                  {c.detail}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-1 text-[11px] font-mono text-slate-500">
                <CheckCircle2 size={12} className="text-primary" />
                <span>Mandatory Condition</span>
              </div>
            </div>
          ))}
        </div>

        {/* Highly Visible Clarification Box */}
        <div className="mt-10 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/80 p-6 sm:p-7 shadow-sm text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-mono font-bold text-primary mb-3">
            <span>MANDATORY RULE</span>
          </div>
          <p className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-snug">
            "Being a CA gives you access to the program and its base benefits. Cash rewards are performance-based and require all eligibility criteria."
          </p>
          <p className="font-sans text-xs sm:text-sm text-text-2 mt-2">
            Only verified conversions through your FestNest referral link/code count. Pending or unverified conversions do not contribute toward your official score.
          </p>
        </div>

      </div>
    </section>
  );
}

