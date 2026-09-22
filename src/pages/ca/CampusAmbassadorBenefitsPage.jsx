// src/pages/ca/CampusAmbassadorBenefitsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, IdCard, UserCheck, Link2, LayoutDashboard, Users, FileCheck, CheckCircle2, ArrowRight, Sparkles, ChevronRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ca } from '../../services/api';
import CANavHeader from './components/CANavHeader';
import CABaseBenefits from './components/CABaseBenefits';
import CAOfficialIdentity from './components/CAOfficialIdentity';
import CAFinalCTA from './components/CAFinalCTA';
import CAFooter from './components/CAFooter';
import { CA_PROGRAM_CONFIG } from './config/caProgramConfig';

export default function CampusAmbassadorBenefitsPage() {
  const { isLoggedIn } = useApp();
  const [existingCA, setExistingCA] = useState(null);

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
              <Award size={14} className="text-primary" />
              <span>Program Benefits &amp; Credentials</span>
            </div>

            <h1 className="font-heading mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
              What Every FestNest CA Gets
            </h1>

            <p className="font-sans mt-4 max-w-2xl mx-auto text-base sm:text-lg text-text-2 leading-relaxed">
              We separate <strong className="text-slate-900">Base Benefits</strong> that every approved ambassador receives from <strong className="text-slate-900">Performance Rewards</strong>. You never need 100 points just to unlock your identity or portal.
            </p>

            {/* Clear 3-Pillar Distinction */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-white border border-border shadow-sm">
                <span className="font-mono text-xs font-bold text-primary block uppercase">Tier 1 • Base Benefits</span>
                <h3 className="font-heading text-base font-bold text-slate-900 mt-1">Approved CA</h3>
                <p className="font-sans text-xs text-text-3 mt-1 leading-relaxed">
                  Gets official CA ID, verified profile, referral code, portal access, and community on day one.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 shadow-sm">
                <span className="font-mono text-xs font-bold text-indigo-700 block uppercase">Tier 2 • Milestone</span>
                <h3 className="font-heading text-base font-bold text-slate-900 mt-1">40 Verified Points</h3>
                <p className="font-sans text-xs text-text-2 mt-1 leading-relaxed">
                  Official FestNest Campus Ambassador Certificate unlocked upon reaching the 40-point milestone.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-sm">
                <span className="font-mono text-xs font-bold text-amber-800 block uppercase">Tier 3 • Performance</span>
                <h3 className="font-heading text-base font-bold text-slate-900 mt-1">100+ Points &amp; Rank</h3>
                <p className="font-sans text-xs text-amber-950 mt-1 leading-relaxed">
                  Satisfies 4 eligibility criteria &amp; competes for monthly (₹1,500) and final (₹8,000) cash rewards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Category A Base Benefits Grid */}
        <CABaseBenefits />

        {/* Official CA Digital Credential Showcase */}
        <CAOfficialIdentity />

        {/* Certificate Milestone Deep Dive */}
        <section className="py-16 bg-gradient-to-b from-surface-2/40 to-white border-b border-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl border-2 border-indigo-200 bg-white p-6 sm:p-10 shadow-sm">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-mono font-bold text-indigo-800">
                    <FileCheck size={14} />
                    <span>MILESTONE CREDENTIAL</span>
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
                    Certificate of Excellence: 40 Verified Points
                  </h2>
                  <p className="font-sans text-sm text-text-2 mt-3 leading-relaxed">
                    We believe student effort should be recognized early. You do not need to wait 6 months or win a cash prize to earn your credential.
                  </p>

                  <div className="mt-5 space-y-2 text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Issued digitally as soon as your verified score reaches 40 points.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Includes a unique verifiable certificate ID &amp; QR verification link.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>Permanently hosted on your FestNest public profile.</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      to="/campus-ambassador/how-it-works"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-dark shadow-sm transition"
                    >
                      <span>How to Earn 40 Points</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      to="/campus-ambassador/rewards"
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-white transition"
                    >
                      <span>Explore Performance Rewards</span>
                    </Link>
                  </div>
                </div>

                {/* Visual Certificate Badge Graphic */}
                <div className="w-full max-w-xs shrink-0 rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white p-6 text-center shadow-md">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white mx-auto shadow-indigo">
                    <Award size={32} />
                  </div>
                  <div className="font-heading font-bold text-slate-900 text-lg mt-4">
                    Official Certificate
                  </div>
                  <div className="font-mono text-xs font-bold text-indigo-700 mt-1">
                    40 Verified Points Milestone
                  </div>
                  <p className="font-sans text-xs text-text-3 mt-2 leading-relaxed">
                    Verifiable credential signed by FestNest leadership certifying campus community leadership.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] font-mono text-emerald-700 font-semibold">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Tamper-Proof Verification</span>
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

