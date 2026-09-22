// src/pages/ca/CampusAmbassadorApplyPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, CheckCircle2, Clock, Users, ArrowRight, Award, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ca } from '../../services/api';
import CANavHeader from './components/CANavHeader';
import CAApplicationForm from './components/CAApplicationForm';
import CAFooter from './components/CAFooter';
import { CA_PROGRAM_CONFIG } from './config/caProgramConfig';

export default function CampusAmbassadorApplyPage() {
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

        {/* Application Page Main Container */}
        <main className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-12">

              {/* Left Column: Program Value, Selection Process & Timeline */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-mono font-semibold text-primary">
                    <Sparkles size={13} />
                    <span>Applications Open • Cohort {CA_PROGRAM_CONFIG.cohortYear}</span>
                  </div>

                  <h1 className="font-heading mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                    Lead Event Discovery on Your Campus.
                  </h1>

                  <p className="font-sans mt-3 text-sm sm:text-base text-text-2 leading-relaxed">
                    Join 60 ambitious student leaders across premier colleges in India. Represent FestNest, connect clubs and fests, and build authentic startup leadership proof.
                  </p>
                </div>

                {/* Key Numbers */}
                <div className="grid grid-cols-3 gap-3 border-y border-border py-4 font-mono text-center">
                  <div className="p-2">
                    <span className="text-xl font-bold text-slate-900 block">{CA_PROGRAM_CONFIG.totalPositions}</span>
                    <span className="text-[10px] uppercase text-text-3 font-semibold">CA Seats</span>
                  </div>
                  <div className="p-2 border-x border-border">
                    <span className="text-xl font-bold text-slate-900 block">{CA_PROGRAM_CONFIG.totalRewardPoolDisplay}</span>
                    <span className="text-[10px] uppercase text-text-3 font-semibold">Reward Pool</span>
                  </div>
                  <div className="p-2">
                    <span className="text-xl font-bold text-slate-900 block">6 Mo</span>
                    <span className="text-[10px] uppercase text-text-3 font-semibold">Duration</span>
                  </div>
                </div>

                {/* What happens after applying */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-xs space-y-4">
                  <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span>What happens after you apply?</span>
                  </h3>

                  <div className="space-y-3 text-xs text-text-2">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono font-bold text-[10px]">
                        1
                      </span>
                      <p><strong className="text-slate-900 font-semibold">Profile Review:</strong> Our campus committee reviews your college network and interest within 48–72 hours.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono font-bold text-[10px]">
                        2
                      </span>
                      <p><strong className="text-slate-900 font-semibold">Official Credentials:</strong> Upon approval, your verified CA ID card and referral links are activated instantly.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono font-bold text-[10px]">
                        3
                      </span>
                      <p><strong className="text-slate-900 font-semibold">Live Portal &amp; Community:</strong> Access your performance hub to track verified signups and meet fellow ambassadors.</p>
                    </div>
                  </div>
                </div>

                {/* Day One Base Benefits Card */}
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 space-y-2 text-xs text-indigo-950">
                  <div className="font-heading font-bold text-indigo-900 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>Base Benefits Guarantee</span>
                  </div>
                  <p className="leading-relaxed">
                    Every approved CA receives their official ID card, verified profile, and community access immediately on day one without needing points.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/campus-ambassador/benefits"
                      className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Explore all Base Benefits</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Application Form */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border-2 border-border bg-white p-6 sm:p-8 shadow-sm">
                  <CAApplicationForm existingCA={existingCA} />
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <CAFooter />
    </div>
  );
}

