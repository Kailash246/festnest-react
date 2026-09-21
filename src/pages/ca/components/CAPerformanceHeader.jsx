// src/pages/ca/components/CAPerformanceHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, RefreshCw, Copy, Check, Share2, GraduationCap, MapPin, Sparkles, ShieldCheck } from 'lucide-react';

export default function CAPerformanceHeader({
  profile,
  performance,
  refreshing,
  copiedKey,
  onSync,
  onCopy,
  onShare,
  generalUrl,
}) {
  return (
    <>
      {/* Top Breadcrumb & Control Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-1.5 text-xs text-text-3 font-medium">
            <Link to="/home" className="hover:text-primary transition">Home</Link>
            <ChevronRight size={13} className="text-text-4" />
            <Link to="/ca" className="hover:text-primary transition">Campus Ambassador</Link>
            <ChevronRight size={13} className="text-text-4" />
            <span className="font-semibold text-slate-900">Portal</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onSync}
              disabled={refreshing}
              title="Sync Ambassador Data"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text-2 hover:bg-surface-2 transition"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-primary' : ''} />
              <span className="hidden sm:inline">Sync Stats</span>
            </button>

            <Link
              to="/ca/leaderboard"
              className="inline-flex items-center gap-1 text-xs font-semibold text-text-2 hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-surface-2 transition"
            >
              Leaderboard
            </Link>

            <Link
              to="/host"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/15 transition"
            >
              + Host Event
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Performance Header Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Left: Identity Profile */}
            <div className="flex items-start sm:items-center gap-4">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl object-cover border-2 border-indigo-400/30 shadow-lg"
                />
              ) : (
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/60 border-2 border-indigo-400/30 text-white font-bold text-2xl font-heading shadow-lg">
                  {profile.name
                    ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
                    : 'CA'}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    {profile.name}
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Active CA
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    performance.isEligible
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30'
                  }`}>
                    {performance.statusLabel}
                  </span>
                </div>

                <p className="font-sans text-xs sm:text-sm text-indigo-200 mt-1 flex items-center gap-1.5 flex-wrap">
                  <GraduationCap size={15} className="text-indigo-400" />
                  <span>{profile.college}</span>
                  <span className="text-indigo-400">•</span>
                  <MapPin size={13} className="text-indigo-400" />
                  <span>{profile.city}</span>
                </p>

                {/* Identity Metadata Pills */}
                <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-lg text-xs font-mono">
                    <span className="text-indigo-300 font-semibold">CA-ID:</span>
                    <span className="text-white font-bold">{profile.caId || 'FN-CA-PENDING'}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-lg text-xs font-mono">
                    <span className="text-indigo-300 font-semibold">Code:</span>
                    <span className="text-amber-300 font-bold">{profile.referralCode}</span>
                    <button
                      type="button"
                      onClick={() => onCopy(profile.referralCode, 'code', 'Ambassador code copied!')}
                      className="ml-1 text-slate-300 hover:text-white transition"
                      title="Copy code"
                    >
                      {copiedKey === 'code' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>

                  <div className="text-xs text-indigo-300 font-sans">
                    Valid thru: <span className="text-white font-mono font-medium">{profile.validThru || '09 / 2028'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick Share Actions */}
            <div className="flex items-center gap-2.5 sm:self-center">
              <button
                type="button"
                onClick={() => onCopy(generalUrl, 'general', 'Referral link copied!')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm active:scale-[0.98]"
              >
                {copiedKey === 'general' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedKey === 'general' ? 'Link Copied!' : 'Copy Referral Link'}</span>
              </button>

              <button
                type="button"
                onClick={onShare}
                className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-white/15 transition active:scale-[0.98]"
                title="Share Ambassador Badge"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

