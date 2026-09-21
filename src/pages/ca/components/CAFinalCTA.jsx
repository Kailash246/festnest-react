// src/pages/ca/components/CAFinalCTA.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CAFinalCTA({ existingCA }) {
  const isApproved = existingCA?.status === 'approved';

  return (
    <section className="bg-gradient-to-br from-primary via-primary-dark to-[#8456B6] py-16 sm:py-20 text-center text-white px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-mono font-semibold text-indigo-100 mb-4 backdrop-blur-sm">
          <Sparkles size={13} />
          <span>FestNest Campus Leadership</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
          Your campus already has events.<br className="hidden sm:inline" />
          Be the person who brings them to FestNest.
        </h2>

        <p className="font-sans mt-4 text-sm sm:text-base text-indigo-100 max-w-xl mx-auto leading-relaxed">
          Join ambitious student ambassadors across premier colleges in India bringing fests, hackathons, and workshops onto one live verified feed.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          {isApproved ? (
            <Link
              to="/ca/portal"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs sm:text-sm font-semibold text-primary hover:bg-surface-2 transition shadow-lg active:scale-[0.98]"
            >
              <span>Open CA Portal</span>
              <ArrowRight size={15} />
            </Link>
          ) : (
            <a
              href="#apply"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs sm:text-sm font-semibold text-primary hover:bg-surface-2 transition shadow-lg active:scale-[0.98]"
            >
              <span>Become a Campus Ambassador</span>
              <ArrowRight size={15} />
            </a>
          )}

          <Link
            to="/explore"
            className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-6 py-3.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            Explore FestNest
          </Link>
        </div>
      </div>
    </section>
  );
}

