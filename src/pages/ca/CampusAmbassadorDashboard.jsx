// src/pages/ca/CampusAmbassadorDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Trophy, Rocket, Megaphone, GraduationCap, QrCode, IdCard,
  ChevronDown, CheckCircle2, MapPin, Star, Handshake, Sparkles,
  Copy, Check, Share2, ExternalLink, ArrowLeft, ArrowRight,
  Clock, AlertCircle, RefreshCw, ShieldCheck, Download, Award,
  Building, Calendar, Send, MessageCircle, FileText, ChevronRight,
  HelpCircle, BookOpen, UserCheck, Target
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ca } from '../../services/api';
import { getReferralUrl } from '../../config/site';
import { calculateCAPerformance } from '../../services/caService';
import useLongWait from '../../hooks/useLongWait';
import LongWaitNotice from '../../components/loading/LongWaitNotice';
import ProgressiveSection from '../../components/loading/ProgressiveSection';

// Subcomponents
import CAPerformanceHeader from './components/CAPerformanceHeader';
import CAPortalBaseBenefits from './components/CAPortalBaseBenefits';
import CAPerformanceOverview from './components/CAPerformanceOverview';
import CARewardProgress from './components/CARewardProgress';
import CAPortalLeaderboardPosition from './components/CAPortalLeaderboardPosition';
import CAActivityLedger from './components/CAActivityLedger';
import CAReferralToolkit from './components/CAReferralToolkit';
import CARewardsAndRules from './components/CARewardsAndRules';
import CAIdentityCard from './components/CAIdentityCard';

// Light-theme skeleton states
function CAPortalLoadingSkeleton() {
  return (
    <div className="font-sans min-h-screen bg-surface-2 text-slate-900 pb-16">
      {/* Top Header Skeleton */}
      <div className="bg-white border-b border-border py-3.5 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="skeleton h-4 w-40 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-7 w-20 rounded-lg" />
            <div className="skeleton h-7 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Hero Banner Skeleton */}
      <div className="bg-slate-900 py-10 px-4 sm:px-6 text-white">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="skeleton h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <div className="skeleton h-6 sm:h-7 w-48 rounded-lg" />
              <div className="skeleton h-4 w-60 rounded" />
              <div className="skeleton h-4 w-36 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-10 w-36 rounded-xl" />
            <div className="skeleton h-10 w-20 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Main Content Skeletons */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 mt-8 space-y-6">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <div className="skeleton h-6 w-52 rounded" />
          <div className="skeleton h-12 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-3">
              <div className="skeleton h-8 w-8 rounded-xl" />
              <div className="skeleton h-7 w-16 rounded" />
              <div className="skeleton h-3.5 w-24 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function CampusAmbassadorDashboard() {
  const navigate = useNavigate();
  const { isLoggedIn, requireAuth, showToast } = useApp();

  const [profileLoading, setProfileLoading] = useState(true);
  const [impactLoading, setImpactLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [serverPerformance, setServerPerformance] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ledger' | 'toolkit' | 'guidelines' | 'leaderboard'
  const [impactLogs, setImpactLogs] = useState([]);
  const [impactTotal, setImpactTotal] = useState(0);

  const isProfileLongWait = useLongWait(profileLoading);
  const isImpactLongWait = useLongWait(impactLoading);

  const fetchProfile = useCallback(async (silent = false) => {
    if (!silent) setProfileLoading(true);
    else setRefreshing(true);

    try {
      const res = await ca.me();
      setProfile(res.data?.profile || null);
      setServerPerformance(res.data?.performance || null);
      if (silent) showToast?.('Ambassador stats updated!', 'success');
    } catch (err) {
      console.error('Failed to load CA profile', err);
    } finally {
      setProfileLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  const fetchImpact = useCallback(async () => {
    setImpactLoading(true);
    try {
      const res = await ca.myImpact({ page: 1, limit: 100 });
      setImpactLogs(res.data?.logs || []);
      setImpactTotal(res.data?.total || 0);
    } catch (err) {
      console.error('Failed to load CA impact logs', err);
    } finally {
      setImpactLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
      fetchImpact();
    } else {
      setProfileLoading(false);
      setImpactLoading(false);
    }
  }, [isLoggedIn, fetchProfile, fetchImpact]);

  // Clean canonical URLs
  const generalUrl = profile?.referralCode ? getReferralUrl(profile.referralCode) : '';
  const hostUrl = profile?.referralCode ? getReferralUrl(profile.referralCode, 'host') : '';
  const exploreUrl = profile?.referralCode ? getReferralUrl(profile.referralCode, 'explore') : '';

  const copyToClipboard = (text, key, message = 'Copied to clipboard!') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast?.(message, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleShareBadge = () => {
    if (!profile) return;
    const shareData = {
      title: `${profile.name} - FestNest Campus Ambassador`,
      text: `Join FestNest to discover verified college fests, hackathons, and competitions across India! Use ambassador code ${profile.referralCode}`,
      url: generalUrl,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      copyToClipboard(generalUrl, 'general', 'Ambassador link copied to clipboard!');
    }
  };

  // State 1: Unauthenticated
  if (!isLoggedIn) {
    return (
      <div className="font-sans min-h-screen bg-surface-2 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-border p-6 sm:p-8 text-center shadow-1">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-5 shadow-sm">
            <IdCard size={28} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">
            Campus Ambassador Portal
          </h2>
          <p className="font-sans mt-2.5 text-xs sm:text-sm text-text-2 leading-relaxed">
            Please log in with your FestNest account to access your ambassador credentials, personal referral hub, and real-time performance tracking.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => requireAuth()}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition shadow-indigo active:scale-[0.98]"
            >
              Log In to Portal
            </button>
            <Link
              to="/campus-ambassador"
              className="w-full py-2.5 border border-border hover:bg-surface-2 text-text-2 font-semibold rounded-xl text-xs sm:text-sm transition text-center"
            >
              Learn About CA Program
            </Link>
            <Link
              to="/home"
              className="text-xs font-semibold text-text-4 hover:text-text-2 transition pt-1"
            >
              ← Back to FestNest Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Loading
  if (profileLoading) {
    return <CAPortalLoadingSkeleton />;
  }

  // State 3: Logged in, Not Applied
  if (!profile) {
    return (
      <div className="font-sans min-h-screen bg-surface-2 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-border p-6 sm:p-8 text-center shadow-1">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-5 shadow-sm">
            <Sparkles size={28} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">
            Become an Ambassador
          </h2>
          <p className="font-sans mt-2.5 text-xs sm:text-sm text-text-2 leading-relaxed">
            You haven't applied for the FestNest Campus Ambassador program yet. Represent your campus, onboard clubs, and receive verified digital credentials.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/campus-ambassador#apply"
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition shadow-indigo text-center active:scale-[0.98]"
            >
              Apply to become a CA
            </Link>
            <Link
              to="/home"
              className="w-full py-2.5 border border-border hover:bg-surface-2 text-text-2 font-semibold rounded-xl text-xs sm:text-sm transition text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Application Submitted / Screening
  if (profile.status === 'applied' || profile.status === 'screening') {
    return (
      <div className="font-sans min-h-screen bg-surface-2 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-1">
          <div className="flex items-center justify-between pb-5 border-b border-border">
            <div>
              <span className="font-heading text-lg font-bold text-primary">FestNest</span>
              <h2 className="font-heading text-2xl font-bold text-slate-900 mt-0.5">Application Status</h2>
            </div>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 font-mono uppercase">
              {profile.status}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-slate-900 text-sm">Application Submitted</h4>
                <p className="font-sans text-xs text-text-3 mt-0.5">
                  Applied for {profile.college}, {profile.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <Clock size={16} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-slate-900 text-sm">Campus Screening &amp; Review</h4>
                <p className="font-sans text-xs text-text-3 mt-0.5">
                  Our team reviews each applicant's campus network and student club involvement. You will be updated via email.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 opacity-50">
              <div className="h-8 w-8 rounded-full bg-surface-3 text-text-4 flex items-center justify-center shrink-0 mt-0.5">
                <IdCard size={16} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-slate-900 text-sm">Credential &amp; Portal Unlocking</h4>
                <p className="font-sans text-xs text-text-3 mt-0.5">
                  Upon approval, your official CA ID, referral link, and performance dashboard unlock here.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex gap-3">
            <Link
              to="/home"
              className="flex-1 py-2.5 bg-surface-2 hover:bg-surface-3 text-text-2 rounded-xl text-xs font-semibold text-center transition"
            >
              Back to Home
            </Link>
            <button
              type="button"
              onClick={() => fetchProfile(true)}
              disabled={refreshing}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98]"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 5: Rejected
  if (profile.status === 'rejected') {
    return (
      <div className="font-sans min-h-screen bg-surface-2 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-border p-6 sm:p-8 text-center shadow-1">
          <div className="w-14 h-14 rounded-2xl bg-surface-3 text-text-3 mx-auto flex items-center justify-center mb-5 shadow-sm">
            <AlertCircle size={28} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Application Update</h2>
          <p className="font-sans mt-2 text-xs sm:text-sm text-text-2 leading-relaxed">
            Thank you for your interest in representing {profile.college}. We were unable to move forward with your application for the current cohort.
          </p>
          {profile.rejectionReason && (
            <p className="mt-3 p-3.5 bg-surface-2 rounded-xl text-xs text-text-2 italic border border-border">
              "{profile.rejectionReason}"
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/explore"
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl text-sm transition shadow-indigo text-center active:scale-[0.98]"
            >
              Explore Events on FestNest
            </Link>
            <Link
              to="/support"
              className="w-full py-2.5 border border-border hover:bg-surface-2 text-text-2 font-semibold rounded-xl text-xs sm:text-sm transition text-center"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 6: APPROVED — Full Performance Dashboard
  const clientPerformance = calculateCAPerformance(profile.stats || {});
  const performance = {
    ...clientPerformance,
    ...(serverPerformance || {}),
    totalPoints: serverPerformance?.points ?? serverPerformance?.totalPoints ?? clientPerformance.totalPoints,
    rank: serverPerformance?.rank ?? null,
  };

  return (
    <div className="font-sans min-h-screen bg-surface-2 text-slate-900 pb-16">
      {/* 1. Portal Header with Identity & Breadcrumbs */}
      <CAPerformanceHeader
        profile={profile}
        performance={performance}
        refreshing={refreshing}
        copiedKey={copiedKey}
        onSync={() => fetchProfile(true)}
        onCopy={copyToClipboard}
        onShare={handleShareBadge}
        generalUrl={generalUrl}
      />

      {/* 2. Portal Sub-Navigation Tabs */}
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-full py-2 text-xs font-semibold scrollbar-none">
            {[
              { id: 'overview', label: 'Overview & Performance', icon: <Trophy size={14} /> },
              { id: 'ledger', label: 'Activity Ledger', count: impactTotal, icon: <Award size={14} /> },
              { id: 'toolkit', label: 'Outreach Toolkit', icon: <Megaphone size={14} /> },
              { id: 'rewards', label: 'Rewards & Rules', icon: <BookOpen size={14} /> },
              { id: 'leaderboard', label: 'Leaderboard', icon: <Target size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] rounded-xl transition ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm font-bold'
                    : 'text-text-2 hover:text-slate-900 hover:bg-surface-2'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`shrink-0 inline-flex items-center justify-center min-w-[18px] ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-surface-3 text-text-2'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area Based on Active Tab */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 mt-8 space-y-6">

        {/* TAB 1: OVERVIEW & PERFORMANCE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Guaranteed Base Benefits Unlocked (Category A) */}
            <CAPortalBaseBenefits performance={performance} profile={profile} />

            {/* Performance Overview (Points, Rank, 4 Stats) */}
            <CAPerformanceOverview performance={performance} />

            {/* Reward Eligibility Progress (Replacing Bronze Milestone) */}
            <CARewardProgress performance={performance} />

            {/* Two Column Row: Official Digital ID Card & Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ID Card Display with Canvas Export */}
              <div className="lg:col-span-5">
                <CAIdentityCard profile={profile} onShare={handleShareBadge} />
              </div>

              {/* Quick Outreach Links & Toolkit Snippet */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                  <h3 className="font-heading text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Rocket size={18} className="text-primary" />
                    <span>Quick Outreach Links</span>
                  </h3>
                  <p className="font-sans text-xs text-text-3 mb-4">
                    Pre-configured with code <span className="font-mono font-bold text-slate-800">{profile.referralCode}</span>.
                  </p>

                  <div className="space-y-3">
                    {/* General Link */}
                    <div className="p-3 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">General Discover Link</div>
                        <div className="text-[11px] font-mono text-text-3 truncate">{generalUrl}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generalUrl, 'quick-general', 'General link copied!')}
                        className="px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
                      >
                        {copiedKey === 'quick-general' ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Host Link */}
                    <div className="p-3 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">Organizer Onboarding Link</div>
                        <div className="text-[11px] font-mono text-text-3 truncate">{hostUrl}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(hostUrl, 'quick-host', 'Host link copied!')}
                        className="px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
                      >
                        {copiedKey === 'quick-host' ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    {/* Explore Link */}
                    <div className="p-3 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">Student Event Discovery Link</div>
                        <div className="text-[11px] font-mono text-text-3 truncate">{exploreUrl}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(exploreUrl, 'quick-explore', 'Explore link copied!')}
                        className="px-3 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
                      >
                        {copiedKey === 'quick-explore' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab('toolkit')}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open full Outreach Toolkit</span>
                      <ArrowRight size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('ledger')}
                      className="text-xs font-semibold text-text-3 hover:text-slate-900 inline-flex items-center gap-1"
                    >
                      <span>View Activity Ledger</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Campus Tip Box */}
                <div className="bg-indigo-50/70 rounded-2xl border border-indigo-100 p-5 flex items-start gap-3">
                  <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-950 leading-relaxed">
                    <span className="font-semibold block mb-0.5">Ambassador Growth Tip:</span>
                    Share your organizer link with club heads and fest convenors. When their events are approved, you earn 10 points total per organizer and progress toward cash eligibility.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVITY LEDGER */}
        {activeTab === 'ledger' && (
          <CAActivityLedger
            impactLogs={impactLogs}
            impactTotal={impactTotal}
            impactLoading={impactLoading}
            referralCode={profile.referralCode}
            onCopyLink={() => copyToClipboard(generalUrl, 'ledger-copy', 'Link copied!')}
          />
        )}

        {/* TAB 3: OUTREACH TOOLKIT */}
        {activeTab === 'toolkit' && (
          <CAReferralToolkit
            profile={profile}
            onCopy={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}

        {/* TAB 4: REWARDS & RULES */}
        {activeTab === 'rewards' && (
          <CARewardsAndRules
            performance={performance}
            profile={profile}
          />
        )}

        {/* TAB 5: LEADERBOARD POSITION & STANDINGS */}
        {activeTab === 'leaderboard' && (
          <CAPortalLeaderboardPosition
            performance={performance}
            profile={profile}
          />
        )}

      </main>
    </div>
  );
}
