// src/pages/ca/components/CAFAQ.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CAFAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Do all Campus Ambassadors receive the CA ID?',
      a: 'Yes. Every selected/approved FestNest Campus Ambassador receives an official verified digital CA identity as a base benefit upon onboarding.',
    },
    {
      q: 'Do all CAs receive cash rewards?',
      a: 'No. Cash rewards are performance-based and are available only to CAs who meet all four minimum eligibility requirements (100+ Points, 40+ Verified Users, 2+ Approved Events, 1+ Verified Organizer) and qualify based on leaderboard rank.',
    },
    {
      q: 'What do I receive immediately after becoming a CA?',
      a: 'Your official CA identity, verified CA profile, personal referral link/code, CA Portal access, outreach toolkit, CA community access, and other base program benefits.',
    },
    {
      q: 'When do I unlock my program certificate?',
      a: 'The official FestNest Campus Ambassador Certificate is unlocked after reaching 40 verified participation points. This milestone is separate from the cash reward eligibility threshold.',
    },
    {
      q: 'Do I need 100 points to remain a CA?',
      a: 'No. The 100-point requirement applies strictly to cash reward eligibility, not to maintaining your CA status or receiving your basic CA benefits.',
    },
    {
      q: 'Do pending referrals count toward my score?',
      a: 'No. Only verified conversions count toward earned points. A student must complete signup verification, and an organizer must be verified before points are attributed.',
    },
    {
      q: 'How much time does the role require weekly?',
      a: 'Most ambassadors invest 2–4 hours per week — mainly sharing upcoming campus events with classmates and introducing fest convenors to the FestNest platform.',
    },
  ];

  return (
    <section className="py-16 bg-surface-2/40 border-b border-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary">
            Clear Answers
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-sm text-text-2 mt-2">
            Everything you need to know about benefits, performance rewards, and verified attribution.
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-white p-2 sm:p-4 shadow-sm">
          {faqs.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={item.q} className="py-3 px-3 sm:px-4">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between text-left gap-4"
                >
                  <span className="font-heading text-sm sm:text-base font-semibold text-slate-900">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="font-sans text-xs sm:text-sm text-text-2 leading-relaxed mt-2.5 pr-6">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

