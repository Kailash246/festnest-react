// src/pages/ca/components/CANavHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, Sparkles } from 'lucide-react';

export default function CANavHeader({ existingCA }) {
  const isApproved = existingCA?.status === 'approved';
  const isPending = existingCA?.status === 'applied' || existingCA?.status === 'screening';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-3 hover:text-primary transition"
          >
            <ArrowLeft size={14} />
            <span className="font-heading font-bold text-sm tracking-tight text-slate-900 hover:text-primary">FestNest</span>
          </Link>
          <span className="text-border">|</span>
          <Link to="/ca" className="inline-flex items-center gap-1.5 font-heading text-sm sm:text-base font-bold text-primary tracking-tight">
            <span>Campus Ambassador</span>
            <span className="hidden md:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              Cohort 2025–26
            </span>
          </Link>
        </div>

        {/* Right Navigation & Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/ca/leaderboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-2 hover:text-primary px-3 py-2 rounded-lg hover:bg-surface-2 transition"
          >
            <Trophy size={14} className="text-amber-500" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Link>

          <Link
            to="/explore"
            className="hidden sm:inline-flex text-xs font-semibold text-text-2 hover:text-primary px-3 py-2 rounded-lg hover:bg-surface-2 transition"
          >
            Explore Events
          </Link>

          {isApproved ? (
            <Link
              to="/ca/portal"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-sm transition active:scale-[0.98]"
            >
              <span>CA Portal</span>
              <ArrowRight size={14} />
            </Link>
          ) : isPending ? (
            <Link
              to="/ca/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-900 hover:bg-amber-100 transition"
            >
              <span>Track Application</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <a
              href="#apply"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-sm transition active:scale-[0.98]"
            >
              <span>Become a CA</span>
              <ArrowRight size={14} />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

