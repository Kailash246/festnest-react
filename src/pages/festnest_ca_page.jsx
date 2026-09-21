// src/pages/festnest_ca_page.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ca } from '../services/api';

import CANavHeader from './ca/components/CANavHeader';
import CAHero from './ca/components/CAHero';
import CAProgressionLadder from './ca/components/CAProgressionLadder';
import CABaseBenefits from './ca/components/CABaseBenefits';
import CAPerformanceBenefits from './ca/components/CAPerformanceBenefits';
import CARewards from './ca/components/CARewards';
import CAEligibility from './ca/components/CAEligibility';
import CAPointSystem from './ca/components/CAPointSystem';
import CAHowItWorks from './ca/components/CAHowItWorks';
import CALeaderboardPreview from './ca/components/CALeaderboardPreview';
import CAWhatYouDo from './ca/components/CAWhatYouDo';
import CAToolkitPreview from './ca/components/CAToolkitPreview';
import CAOfficialIdentity from './ca/components/CAOfficialIdentity';
import CAFAQ from './ca/components/CAFAQ';
import CAApplicationForm from './ca/components/CAApplicationForm';
import CAFinalCTA from './ca/components/CAFinalCTA';

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

  // Smooth scroll to hash anchor on load or navigation (e.g. #apply, #how, #rewards, #eligibility)
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120);
      }
    }
  }, []);

  return (
    <div className="font-sans min-h-screen bg-surface text-slate-900 selection:bg-primary/15 selection:text-slate-900">
      {/* 1. Header Navigation */}
      <CANavHeader existingCA={existingCA} />

      {/* 2. Hero Section */}
      <CAHero existingCA={existingCA} />

      {/* 3. 4-Stage Progression Ladder */}
      <CAProgressionLadder />

      {/* 4. Category A: Base Benefits (What every approved CA gets) */}
      <CABaseBenefits />

      {/* 5. Category B: Performance-Based Rewards */}
      <CAPerformanceBenefits />

      {/* 6. Rewards Distribution Section */}
      <CARewards />

      {/* 7. Minimum Reward Eligibility Criteria */}
      <CAEligibility />

      {/* 8. Point System Explanation */}
      <CAPointSystem />

      {/* 9. How It Works (6-step progression) */}
      <CAHowItWorks />

      {/* 10. Public Leaderboard Preview */}
      <CALeaderboardPreview />

      {/* 11. What a CA Actually Does */}
      <CAWhatYouDo />

      {/* 12. CA Toolkit Preview */}
      <CAToolkitPreview existingCA={existingCA} />

      {/* 13. Official CA Identity Credential */}
      <CAOfficialIdentity />

      {/* 14. Clear FAQs & Rules */}
      <CAFAQ />

      {/* 15. Application Form */}
      <CAApplicationForm existingCA={existingCA} />

      {/* 16. Final Closing Call to Action */}
      <CAFinalCTA existingCA={existingCA} />
    </div>
  );
}
