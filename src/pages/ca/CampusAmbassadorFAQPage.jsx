// src/pages/ca/CampusAmbassadorFAQPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Search, MessageSquare, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ca } from '../../services/api';
import CANavHeader from './components/CANavHeader';
import CAFinalCTA from './components/CAFinalCTA';
import CAFooter from './components/CAFooter';
import { CA_PROGRAM_CONFIG } from './config/caProgramConfig';

export default function CampusAmbassadorFAQPage() {
  const { isLoggedIn } = useApp();
  const [existingCA, setExistingCA] = useState(null);
  const [openIdx, setOpenIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Program & Benefits', 'Points & Scoring', 'Rewards & Payouts', 'Eligibility'];

  const allFaqs = [
    {
      category: 'Program & Benefits',
      q: 'Do all selected Campus Ambassadors receive the official CA ID?',
      a: 'Yes! Every selected and approved FestNest Campus Ambassador receives an official verified digital CA identity as a Category A Base Benefit upon onboarding, complete with a unique ID number and QR verification mark.',
    },
    {
      category: 'Program & Benefits',
      q: 'What do I receive immediately after becoming an approved CA?',
      a: 'You receive your official CA ID card, verified CA profile on FestNest, personal referral link & code, CA Portal access with live analytics, invitation to the private CA Community channel, and official startup leadership recognition.',
    },
    {
      category: 'Program & Benefits',
      q: 'When do I unlock my official Program Certificate?',
      a: 'The official FestNest Campus Ambassador Certificate of Excellence is unlocked after reaching 40 verified participation points. This milestone is designed as an achievable early accomplishment separate from the cash reward eligibility threshold.',
    },
    {
      category: 'Points & Scoring',
      q: 'How are points earned and converted?',
      a: 'Points are awarded transparently: +1 point per verified student signup; +5 points when a campus club or student organizer completes verification; and +5 additional points when that referred organizer publishes their first approved event (+10 points total for organizer + 1st event). Subsequent events by the same organizer do not award additional points to prevent spam.',
    },
    {
      category: 'Points & Scoring',
      q: 'Do pending referrals or unverified accounts count toward my score?',
      a: 'No. Only verified conversions count toward earned points. A student must complete account verification, and an event organizer must be verified by the FestNest team before points are credited.',
    },
    {
      category: 'Points & Scoring',
      q: 'How does referral attribution work?',
      a: 'When students or organizers visit FestNest through your unique referral link (e.g. ?ref=YOUR_CODE) or enter your code during onboarding, our system automatically links their profile to your ambassador account. Credit is permanent and cannot be overwritten.',
    },
    {
      category: 'Rewards & Payouts',
      q: 'Do all Campus Ambassadors receive cash rewards?',
      a: 'No. Cash rewards are performance-based. Only ambassadors who satisfy all four minimum eligibility criteria (100+ points, 40+ verified users, 2+ approved events, 1+ verified organizer) and rank within the prize-winning leaderboard positions (Monthly Top 3 or Grand Finale Top 10) receive cash payouts.',
    },
    {
      category: 'Rewards & Payouts',
      q: 'What is the total reward pool and how is it distributed?',
      a: 'The total reward pool is ₹45,000* (₹43,800 scheduled + ₹1,200 performance reserve). Monthly rewards distribute ₹2,800 every month (₹1,500 1st, ₹800 2nd, ₹500 3rd) across 6 cycles (₹16,800 total). The Grand Finale distributes ₹27,000 across the Top 10 ambassadors (₹8,000 champion, ₹5,000 runner-up, down to ₹1,200 for 6th–10th).',
    },
    {
      category: 'Rewards & Payouts',
      q: 'How and when are cash rewards paid out?',
      a: 'Monthly rewards are disbursed within 7 business days following the conclusion of each calendar month directly via UPI or verified Indian bank account. Grand Finale rewards are awarded at the end of the 6-month cohort.',
    },
    {
      category: 'Eligibility',
      q: 'Do I need 100 points to remain an active Campus Ambassador?',
      a: 'No. You do not need 100 points to stay in the program or use your CA credentials. The 100-point threshold applies exclusively to cash reward payout eligibility.',
    },
    {
      category: 'Eligibility',
      q: 'What happens if I have 100 points but only 30 users?',
      a: 'You will not be reward eligible. All 4 minimum criteria (100+ points, 40+ verified users, 2+ approved events, 1+ verified organizer) must be met simultaneously before an ambassador can receive cash rewards.',
    },
    {
      category: 'Program & Benefits',
      q: 'How much time does the Campus Ambassador role require weekly?',
      a: 'Most ambassadors invest 2–4 hours per week. Activities include sharing fest announcements on student WhatsApp groups, inviting club convenors to list their fests, and tracking conversions via your CA portal.',
    },
  ];

  const filteredFaqs = allFaqs.filter((faq) => {
    const matchesCat = activeCategory === 'All' || faq.category === activeCategory;
    const matchesQuery =
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

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
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-mono font-semibold text-primary">
              <HelpCircle size={14} className="text-primary" />
              <span>Support &amp; Program Guide</span>
            </div>

            <h1 className="font-heading mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h1>

            <p className="font-sans mt-4 max-w-2xl mx-auto text-base sm:text-lg text-text-2 leading-relaxed">
              Clear, transparent answers on base benefits, verified scoring, certificate milestones, and cash reward eligibility.
            </p>

            {/* Instant Search Bar */}
            <div className="mt-8 max-w-lg mx-auto relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions (e.g. certificate, payouts, points)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-white text-xs sm:text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-2 text-text-2 hover:bg-slate-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="py-16 bg-white border-b border-border">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-text-3">
                <HelpCircle size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="font-heading font-bold text-slate-700 text-sm">No matching questions found</p>
                <p className="text-xs text-text-3 mt-1">Try a different search term or select another category.</p>
              </div>
            ) : (
              <div className="divide-y divide-border rounded-2xl border border-border bg-white p-2 sm:p-4 shadow-sm">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openIdx === idx;
                  return (
                    <div key={faq.q} className="py-3 px-3 sm:px-4">
                      <button
                        type="button"
                        onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                        className="flex w-full items-center justify-between text-left gap-4"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-2 text-text-3 shrink-0">
                            {faq.category}
                          </span>
                          <span className="font-heading text-sm sm:text-base font-semibold text-slate-900">
                            {faq.q}
                          </span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                            isOpen ? 'rotate-180 text-primary' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <p className="font-sans text-xs sm:text-sm text-text-2 leading-relaxed mt-3 pl-2 sm:pl-3 border-l-2 border-primary/30">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Need More Help Card */}
            <div className="mt-12 rounded-2xl border border-border bg-surface-2/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm">Still have questions?</h4>
                  <p className="font-sans text-xs text-text-3 mt-0.5">
                    Our campus relations team is here to assist you.
                  </p>
                </div>
              </div>

              <Link
                to="/support"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white border border-border px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                <span>Contact Campus Support</span>
                <ArrowRight size={13} />
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

