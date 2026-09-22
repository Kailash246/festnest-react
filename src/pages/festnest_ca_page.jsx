// src/pages/festnest_ca_page.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ca } from '../services/api';

import CANavHeader from './ca/components/CANavHeader';
import CAHero from './ca/components/CAHero';
import CABaseBenefits from './ca/components/CABaseBenefits';
import CAWhatYouDo from './ca/components/CAWhatYouDo';
import CALeaderboardPreview from './ca/components/CALeaderboardPreview';
import CAHowItWorks from './ca/components/CAHowItWorks';
import CAFinalCTA from './ca/components/CAFinalCTA';
import CAFooter from './ca/components/CAFooter';

export default function CampusAmbassadorPage() {
  const { isLoggedIn } = useApp();
  const [existingCA, setExistingCA] = useState(null);
  const [checkingCA, setCheckingCA] = useState(false);

  // Check if logged-in user already has a CA application
  useEffect(() => {
    if (isLoggedIn) {
      setCheckingCA(true);
      ca.me()
        .then((res) => {
          if (res.data?.profile) {
            setExistingCA(res.data.profile);
          }
        })
        .catch(() => {
          // ignore error if unapplied
        })
        .finally(() => setCheckingCA(false));
    }
  }, [isLoggedIn]);

  return (
    <div className="font-sans min-h-screen bg-surface text-slate-900 selection:bg-primary/15 selection:text-slate-900 flex flex-col justify-between">
      <div>
        {/* 1. Sticky Navigation Header */}
        <CANavHeader existingCA={existingCA} />

        {/* 2. High-Impact Hero (Reward-First, ₹45k Pool, 60 Seats, Scorecard Visual) */}
        <CAHero existingCA={existingCA} />

        {/* 3. Base Benefits Strip (What every approved CA gets + 40 pts certificate milestone) */}
        <CABaseBenefits />

        {/* 4. What a CA Actually Does (4 Growth Pillars) */}
        <CAWhatYouDo />

        {/* 5. Live Transparent Leaderboard Preview (Top 5 active CAs with verified points) */}
        <CALeaderboardPreview />

        {/* 6. Fast 6-Step Journey Preview */}
        <CAHowItWorks />

        {/* 7. High-Conversion Final Call to Action */}
        <CAFinalCTA existingCA={existingCA} />
      </div>

      {/* 8. Comprehensive CA Footer */}
      <CAFooter />
    </div>
  );
}
