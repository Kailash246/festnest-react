// src/pages/landing/MobileLanding.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import BrandMark from '../../components/BrandMark';
import { events as eventsApi } from '../../services/api';
import { Code2, Music, Trophy, PartyPopper, BriefcaseBusiness, Rocket } from 'lucide-react';

// Priority categories, in order.
const CATEGORIES = [
  { icon: PartyPopper,       label: 'Mega Fests',     bg: 'bg2' },
  { icon: Code2,             label: 'Hackathons',     bg: 'bg1' },
  { icon: BriefcaseBusiness, label: 'Management',     bg: 'bg8' },
  { icon: Rocket,            label: 'Startups',       bg: 'bg7' },
  { icon: Music,             label: 'Cultural Fests', bg: 'bg5' },
  { icon: Trophy,            label: 'Sports',         bg: 'bg4' },
];

export default function MobileLanding() {
  const navigate = useNavigate();
  const { requireAuth, isLoggedIn } = useApp();
  const [apiStats,     setApiStats]     = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    eventsApi.stats()
      .then(r => setApiStats(r.data))
      .catch(() => setApiStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleSignIn  = () => requireAuth();
  const handleExplore = () => navigate('/explore');

  return (
    <div className="min-h-dvh bg-white flex flex-col overflow-x-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BrandMark className="w-8 h-8" />
          <span className="font-display font-bold text-[20px] text-primary tracking-[-0.4px]">FestNest</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/blog')}
            className="px-3 py-2 text-[13px] font-semibold text-text-2
                       hover:text-primary transition-colors">
            Blog
          </button>
          {!isLoggedIn && (
            <button onClick={handleSignIn}
              className="px-4 py-2 border border-border rounded-md text-[13px] font-semibold text-text-2
                         hover:border-primary hover:text-primary transition-colors">
              Log in
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col px-5 pt-8 pb-6">

        {/* Badge */}
        <div className="inline-flex self-start items-center gap-2 bg-primary-light border border-[#C7D2FE]
                        rounded-full pl-1.5 pr-3.5 py-1 mb-5">
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
          <span className="text-[12px] font-semibold text-primary">Live events across India</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-[32px] leading-[1.1] tracking-tight text-text-1 mb-4">
          Discover every college event in India.{' '}
          <span className="lp-gradient-text">In one place.</span>
        </h1>

        <p className="text-[15px] text-text-2 leading-relaxed mb-8">
          Hackathons, fests, workshops &amp; competitions from colleges across India. Never miss a deadline again.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mb-8">
          <button onClick={handleExplore}
            className="w-full py-4 bg-primary text-white font-bold text-[16px] rounded-md
                       hover:bg-primary-dark active:scale-[0.98] transition-all">
            Explore Events
          </button>
          {!isLoggedIn && (
            <button onClick={handleSignIn}
              className="w-full py-4 bg-white border-[1.5px] border-border-strong text-text-1
                         font-bold text-[16px] rounded-md hover:border-primary hover:text-primary
                         active:scale-[0.98] transition-all">
              Create Free Account
            </button>
          )}
        </div>

        {/* Stats — real API data, skeleton while loading, hidden on failure */}
        {(statsLoading || apiStats) && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {statsLoading ? (
              [0, 1, 2].map(i => (
                <div key={i} className="bg-surface-2 rounded-lg py-4 text-center">
                  <div className="skeleton h-6 w-14 rounded mx-auto mb-1" />
                  <div className="skeleton h-3 w-10 rounded mx-auto" />
                </div>
              ))
            ) : [
              { value: apiStats.totalEvents.toLocaleString('en-IN') + '+', label: 'Events' },
              { value: apiStats.totalColleges.toLocaleString('en-IN') + '+', label: 'Colleges' },
              { value: String(apiStats.totalCategories), label: 'Categories' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-surface-2 rounded-lg py-4 text-center">
                <div className="font-display font-bold text-[22px] text-text-1 leading-none">{value}</div>
                <div className="text-[11px] text-text-3 font-semibold mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        <div>
          <div className="text-[12px] font-bold tracking-wider uppercase text-text-3 mb-3">Browse by Category</div>
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map(({ icon: Icon, label, bg }) => (
              <button key={label} onClick={handleExplore}
                className={`${bg} rounded-lg p-4 flex items-center gap-3 text-left
                             hover:opacity-80 active:scale-[0.97] transition-all`}>
                <Icon className="w-7 h-7 text-white/80 flex-shrink-0" />
                <span className="font-display font-bold text-[14px] text-text-1 leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-border text-center">
        <p className="text-[12px] text-text-3">Free for students · forever</p>
      </div>
    </div>
  );
}
