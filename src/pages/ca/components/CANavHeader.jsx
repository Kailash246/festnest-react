// src/pages/ca/components/CANavHeader.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, Menu, X, Gift, Award, Compass } from 'lucide-react';

export default function CANavHeader({ existingCA }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isApproved = existingCA?.status === 'approved';
  const isPending = existingCA?.status === 'applied' || existingCA?.status === 'screening';

  const navLinks = [
    { label: 'Rewards', path: '/campus-ambassador/rewards', icon: Gift },
    { label: 'Benefits', path: '/campus-ambassador/benefits', icon: Award },
    { label: 'How It Works', path: '/campus-ambassador/how-it-works', icon: Compass },
    { label: 'Leaderboard', path: '/campus-ambassador/leaderboard', icon: Trophy },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname === path.replace('/campus-ambassador', '/ca');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-3 hover:text-primary transition"
            title="Back to FestNest Home"
          >
            <ArrowLeft size={14} />
            <span className="font-heading font-bold text-sm tracking-tight text-slate-900 hover:text-primary">FestNest</span>
          </Link>
          <span className="text-border">|</span>
          <Link to="/campus-ambassador" className="inline-flex items-center gap-2 font-heading text-sm sm:text-base font-bold text-primary tracking-tight">
            <span>Campus Ambassador</span>
            <span className="hidden md:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              Cohort 2025–26
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-text-2 hover:text-slate-900 hover:bg-surface-2'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Navigation & Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick FAQ text link on desktop */}
          <Link
            to="/campus-ambassador/faq"
            className="hidden sm:inline-flex text-xs font-semibold text-text-3 hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition"
          >
            FAQ
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
              <span>Track Status</span>
              <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              to="/campus-ambassador/apply"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-primary-dark shadow-sm transition active:scale-[0.98]"
            >
              <span>Become a CA</span>
              <ArrowRight size={14} />
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl text-text-2 hover:text-slate-900 hover:bg-surface-2 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-white px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'bg-surface-2/60 text-slate-800 hover:bg-surface-2'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-primary' : 'text-text-3'} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <Link
              to="/campus-ambassador/eligibility"
              onClick={() => setMobileMenuOpen(false)}
              className="text-text-2 hover:text-primary py-1"
            >
              Eligibility Criteria
            </Link>
            <Link
              to="/campus-ambassador/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-text-2 hover:text-primary py-1"
            >
              FAQ
            </Link>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="text-text-3 hover:text-slate-800 py-1"
            >
              Explore Events
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
