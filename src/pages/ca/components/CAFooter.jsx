// src/pages/ca/components/CAFooter.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, Gift, Award, Compass, HelpCircle, FileCheck, ExternalLink } from 'lucide-react';
import { CA_PROGRAM_CONFIG } from '../config/caProgramConfig';

export default function CAFooter() {
  return (
    <footer className="border-t border-border bg-white text-slate-700 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/home" className="inline-flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
              <span className="text-primary font-black">FestNest</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-3 px-2 py-0.5 rounded-full bg-surface-2 border border-border">
                CA Cohort {CA_PROGRAM_CONFIG.cohortYear}
              </span>
            </Link>
            <p className="font-sans text-xs text-text-2 mt-3 leading-relaxed max-w-sm">
              The official FestNest Campus Ambassador Program empowers student leaders to connect their college communities with premier fests, hackathons, and cultural events across India.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-text-3">
              <Sparkles size={13} className="text-amber-500" />
              <span>{CA_PROGRAM_CONFIG.totalPositions} Positions • {CA_PROGRAM_CONFIG.totalRewardPoolDisplay} Total Reward Pool</span>
            </div>
          </div>

          {/* Program Pages */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Program Details
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/campus-ambassador/rewards" className="text-text-2 hover:text-primary transition">
                  Performance Rewards
                </Link>
              </li>
              <li>
                <Link to="/campus-ambassador/benefits" className="text-text-2 hover:text-primary transition">
                  Base Benefits &amp; ID Card
                </Link>
              </li>
              <li>
                <Link to="/campus-ambassador/how-it-works" className="text-text-2 hover:text-primary transition">
                  How It Works &amp; Points
                </Link>
              </li>
              <li>
                <Link to="/campus-ambassador/eligibility" className="text-text-2 hover:text-primary transition">
                  Eligibility Criteria
                </Link>
              </li>
              <li>
                <Link to="/campus-ambassador/leaderboard" className="text-text-2 hover:text-primary transition">
                  Live Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Opportunities & Apply */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Get Started
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/campus-ambassador/apply" className="font-semibold text-primary hover:text-primary-dark transition">
                  Apply for Cohort
                </Link>
              </li>
              <li>
                <Link to="/campus-ambassador/faq" className="text-text-2 hover:text-primary transition">
                  Ambassador FAQs
                </Link>
              </li>
              <li>
                <Link to="/ca/portal" className="text-text-2 hover:text-primary transition">
                  CA Portal Login
                </Link>
              </li>
              <li>
                <Link to="/ca/dashboard" className="text-text-2 hover:text-primary transition">
                  Application Status
                </Link>
              </li>
            </ul>
          </div>

          {/* FestNest Platform */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              FestNest Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore" className="text-text-2 hover:text-primary transition">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/host" className="text-text-2 hover:text-primary transition">
                  Host an Event
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-text-2 hover:text-primary transition">
                  Help &amp; Support
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-text-3 hover:text-slate-900 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-text-3 hover:text-slate-900 transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-3 font-mono">
          <p>© {new Date().getFullYear()} FestNest. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Performance rewards are subject to transparent verification and minimum eligibility criteria.
          </p>
        </div>
      </div>
    </footer>
  );
}

