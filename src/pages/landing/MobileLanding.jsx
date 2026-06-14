// src/pages/landing/MobileLanding.jsx
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Code2, Music, Wrench, Trophy } from 'lucide-react';

const STATS = [
  { value: '48K+', label: 'Students' },
  { value: '2.4K+', label: 'Events' },
  { value: '850+', label: 'Colleges' },
];

const CATEGORIES = [
  { icon: Code2,  label: 'Hackathons',    bg: 'bg1' },
  { icon: Music,  label: 'Cultural Fests', bg: 'bg5' },
  { icon: Wrench, label: 'Workshops',     bg: 'bg3' },
  { icon: Trophy, label: 'Competitions',  bg: 'bg7' },
];

export default function MobileLanding() {
  const navigate = useNavigate();
  const { requireAuth, isLoggedIn } = useApp();

  const handleSignIn  = () => requireAuth();
  const handleExplore = () => navigate('/explore');

  return (
    <div className="min-h-dvh bg-white flex flex-col overflow-x-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 14 14" fill="none" className="w-[18px] h-[18px]">
              <path d="M7 2C4.24 2 2 4.24 2 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 2c.83 0 1.5.67 1.5 1.5S7.83 7 7 7s-1.5-.67-1.5-1.5S6.17 4 7 4zm0 7.2c-1.25 0-2.35-.63-3-1.58.02-.98 2-.98 3-.98s2.98.01 3 .98c-.65.95-1.75 1.58-3 1.58z" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-bold text-[20px] text-primary tracking-[-0.4px]">FestNest</span>
        </div>
        {!isLoggedIn && (
          <button onClick={handleSignIn}
            className="px-4 py-2 border border-border rounded-lg text-[13px] font-semibold text-text-2
                       hover:border-primary hover:text-primary transition-colors">
            Log in
          </button>
        )}
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col px-5 pt-8 pb-6">

        {/* Badge */}
        <div className="inline-flex self-start items-center gap-2 bg-primary-light border border-[#C7D2FE]
                        rounded-full pl-1.5 pr-3.5 py-1 mb-5">
          <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
          <span className="text-[12px] font-semibold text-primary">2,400+ live events across India</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-bold text-[32px] leading-[1.1] tracking-tight text-text-1 mb-4">
          Discover every college event in India.{' '}
          <span className="lp-gradient-text">In one place.</span>
        </h1>

        <p className="text-[15px] text-text-2 leading-relaxed mb-8">
          Hackathons, fests, workshops &amp; competitions from <strong className="text-text-1">850+ colleges</strong>. Never miss a deadline again.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 mb-8">
          <button onClick={handleExplore}
            className="w-full py-4 bg-primary text-white font-bold text-[16px] rounded-2xl
                       hover:bg-primary-dark active:scale-[0.98] transition-all">
            Explore Events
          </button>
          {!isLoggedIn && (
            <button onClick={handleSignIn}
              className="w-full py-4 bg-white border-[1.5px] border-border-strong text-text-1
                         font-bold text-[16px] rounded-2xl hover:border-primary hover:text-primary
                         active:scale-[0.98] transition-all">
              Create Free Account
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-surface-2 rounded-2xl py-4 text-center">
              <div className="font-display font-bold text-[22px] text-text-1 leading-none">{value}</div>
              <div className="text-[11px] text-text-3 font-semibold mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div>
          <div className="text-[12px] font-bold tracking-wider uppercase text-text-3 mb-3">Browse by Category</div>
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map(({ icon: Icon, label, bg }) => (
              <button key={label} onClick={handleExplore}
                className={`${bg} rounded-2xl p-4 flex items-center gap-3 text-left
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
        <p className="text-[12px] text-text-3">Free for students forever · 48,000+ on board</p>
      </div>
    </div>
  );
}
