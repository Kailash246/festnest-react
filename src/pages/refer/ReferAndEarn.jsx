/**
 * FestNest — Refer & Earn
 * ============================================================================
 * Drop this file in at: src/pages/refer/ReferAndEarn.jsx
 *
 * WHAT THIS FILE IS
 * A complete, production-styled page for FestNest's Refer & Earn + Spin Wheel
 * system. It matches the FestNest UI Design System Report (Geist Sans body /
 * DM Sans headings / Geist Mono numerics, reduced-radius scale, semantic
 * color tokens, shadow-1/2/3, Framer Motion timing curves).
 *
 * Every number on this page — FN Coins, referral counts, event-registration
 * counts, spin eligibility, and the spin result itself — comes from the
 * backend. Nothing here is calculated client-side, by design (see the
 * "Refer & Earn + Spin Wheel" spec this was built against).
 *
 * IMPORTANT — "FN Coins" vs "Points": FN Coins are earned ONLY through this
 * Refer & Earn program (10 per verified referral, spent 200-at-a-time on a
 * spin). They are a completely separate currency from the existing FestNest
 * "Points" a user earns for hosting or registering for events (User.points).
 * Do not read/write User.points anywhere on this page or in its backend —
 * use a dedicated FN Coins balance/ledger instead. Keep the two systems
 * fully unlinked so this program can never inflate a user's event Points.
 *
 * ----------------------------------------------------------------------------
 * INTEGRATION POINTS (search for "INTEGRATION POINT" — there are 3)
 * ----------------------------------------------------------------------------
 * 1. The `api` import below must point at FestNest's existing request
 *    wrapper — the one that already retries/refreshes JWTs on 401 (the same
 *    one AuthOverlay.jsx / Profile.jsx use). Do NOT replace this with a bare
 *    fetch()/new axios instance, or refresh-token handling silently breaks
 *    on this page only.
 * 2. Add a route in App.jsx behind the same auth guard as /profile, e.g.
 *      <Route path="/refer" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
 * 3. Add a nav entry (Sidebar.jsx desktop / BottomNav.jsx or MobileDrawer.jsx
 *    mobile) — a Gift icon fits the existing icon vocabulary.
 *
 * ----------------------------------------------------------------------------
 * BACKEND API CONTRACT THIS PAGE EXPECTS
 * ----------------------------------------------------------------------------
 * GET  /api/refer/summary
 *   -> {
 *        referralCode: string,
 *        referralLink: string,
 *        fnCoins: { available: number, required: number },
 *        milestone: {
 *          referrals: { count: number, required: number },
 *          eventRegistrations: { count: number, required: number }
 *        },
 *        totals: { referrals: number, verifiedReferrals: number, eventRegistrations: number },
 *        availableSpins: number
 *      }
 *
 * GET  /api/refer/history?type=referrals&page=1
 *   -> {
 *        items: [{
 *          id: string, name: string, date: string (ISO),
 *          status: 'verified' | 'pending' | 'invalid',
 *          fnCoins: number,
 *          eventStatus: 'registered' | 'not_registered' | 'pending' | null
 *        }],
 *        hasMore: boolean
 *      }
 *
 * GET  /api/refer/history?type=spins&page=1
 *   -> {
 *        items: [{
 *          id: string, date: string (ISO), rewardLabel: string,
 *          status: 'pending' | 'under_review' | 'approved' | 'paid' | 'credited' | 'rejected' | 'cancelled'
 *        }],
 *        hasMore: boolean
 *      }
 *
 * GET  /api/refer/wheel-config
 *   -> { segments: [{ id: string, label: string, type: 'cash'|'fn_coins'|'merch'|'bonus_spin'|'none' }] }
 *   Probabilities/weights are never sent to the client — the backend keeps
 *   that private, per the anti-fraud requirements. A 'fn_coins' segment
 *   awards bonus FN Coins — it never touches the separate User.points
 *   (event-hosting/registration) system.
 *
 * POST /api/refer/spin   body: { idempotencyKey: string }
 *   -> success: {
 *        spinId: string, winningSegmentId: string,
 *        reward: { label: string, type: string, value: number | null },
 *        fnCoinsRemaining: number, spinsRemaining: number
 *      }
 *   -> failure (4xx): { code: 'NOT_ELIGIBLE' | 'NO_SPINS_LEFT' | 'ALREADY_PROCESSING', message: string }
 *
 * The idempotencyKey is generated once per spin *attempt* and reused across
 * retries of that same attempt (network failure, timeout) so a resend can
 * never award two spins for one click — see handleSpin() below.
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Gift, Users, Ticket, Coins, Lock, PartyPopper, Copy, Check, Share2,
  MessageCircle, ChevronDown, Info, Loader2, AlertCircle, RefreshCw,
  Sparkles, X, Trophy, Clock, CheckCircle2, XCircle, IndianRupee, Star,
  HelpCircle, ArrowUpRight,
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import ErrorBoundary from '../../components/ErrorBoundary';

// INTEGRATION POINT 1 — point this at the project's existing request wrapper.
import api from '../../services/api';

// ============================================================================
// Constants & lookup tables
// ============================================================================

const REFERRAL_STATUS_META = {
  verified: { label: 'Verified', text: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', Icon: CheckCircle2 },
  pending: { label: 'Pending', text: 'text-[#B45309]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', Icon: Clock },
  invalid: { label: 'Not counted', text: 'text-text-4', bg: 'bg-surface-3', border: 'border-border', Icon: XCircle },
};

const EVENT_STATUS_META = {
  registered: { label: 'Registered', text: 'text-[#16A34A]', Icon: CheckCircle2 },
  pending: { label: 'Verifying', text: 'text-[#2563EB]', Icon: Clock },
  not_registered: { label: 'Not yet', text: 'text-text-4', Icon: XCircle },
};

const SPIN_STATUS_META = {
  pending: { label: 'Pending', text: 'text-[#B45309]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]' },
  under_review: { label: 'Under review', text: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]' },
  approved: { label: 'Approved', text: 'text-[#2563EB]', bg: 'bg-[#EFF6FF]', border: 'border-[#BFDBFE]' },
  paid: { label: 'Paid', text: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' },
  credited: { label: 'Credited', text: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]' },
  rejected: { label: 'Rejected', text: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]' },
  cancelled: { label: 'Cancelled', text: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]' },
};

const REWARD_TYPE_ICON = { cash: IndianRupee, fn_coins: Coins, points: Coins, merch: Gift, bonus_spin: RefreshCw, none: Star };

const WHEEL_COLORS = ['#4F46E5', '#F59E0B', '#3730A3', '#FBBF24', '#818CF8', '#B45309'];

// ============================================================================
// Small utilities
// ============================================================================

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function polarToCartesian(cx0, cy0, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx0 + r * Math.cos(angleRad), y: cy0 + r * Math.sin(angleRad) };
}

function describeWedge(cx0, cy0, r, startAngle, endAngle) {
  const start = polarToCartesian(cx0, cy0, r, endAngle);
  const end = polarToCartesian(cx0, cy0, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx0} ${cy0} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 0 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
}

function makeIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `spin-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildLockedMessage({ referralsNeeded, registrationsNeeded, coinsNeeded }) {
  const clauses = [];
  if (referralsNeeded > 0) {
    clauses.push(`refer ${referralsNeeded} more ${referralsNeeded === 1 ? 'friend' : 'friends'}`);
  }
  if (registrationsNeeded > 0) {
    clauses.push(`get ${registrationsNeeded} more of them registered for an event`);
  }
  if (clauses.length === 0 && coinsNeeded > 0) {
    clauses.push(`earn ${coinsNeeded} more FN Coins`);
  }
  if (clauses.length === 0) return "You're almost there — check back after your next referral is verified.";
  return `You need to ${clauses.join(' and ')} to unlock your next spin.`;
}

// ============================================================================
// Presentational primitives
// ============================================================================

function ProgressBar({ value, max, tone = 'primary' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fill = tone === 'amber' ? 'bg-[#F59E0B]' : tone === 'green' ? 'bg-[#16A34A]' : 'bg-primary';
  return (
    <div
      className="h-2 w-full rounded-full bg-surface-3 overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <motion.div
        className={cx('h-full rounded-full', fill)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

function StatCard({ icon: IconEl, label, current, target, suffix, tone, mono = true }) {
  return (
    <div className="bg-white border border-border rounded-lg p-4 shadow-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-text-2">{label}</span>
        <span
          className={cx(
            'w-8 h-8 rounded-md flex items-center justify-center shrink-0',
            tone === 'amber' ? 'bg-[#FFFBEB] text-[#B45309]' : tone === 'green' ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-primary-light text-primary'
          )}
        >
          <IconEl size={16} strokeWidth={2} />
        </span>
      </div>
      <p className={cx('text-2xl font-bold text-text-1 mb-2', mono && 'font-mono tabular-nums')}>
        {current}
        <span className="text-text-4 text-base font-medium">/{target}{suffix}</span>
      </p>
      <ProgressBar value={current} max={target} tone={tone} />
    </div>
  );
}

function SectionCard({ children, className }) {
  return <div className={cx('bg-white border border-border rounded-lg p-5', className)}>{children}</div>;
}

function InlineSkeleton({ className }) {
  return <div className={cx('skeleton rounded-md', className)} />;
}

// ============================================================================
// How it works
// ============================================================================

function HowItWorksPanel() {
  const [open, setOpen] = useState(false);
  return (
    <SectionCard>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Info size={18} strokeWidth={2} className="text-primary" />
          <span className="font-heading font-bold text-[16px] text-text-1">How Refer &amp; Earn works</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={18} className="text-text-3" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border space-y-3 text-[14px] text-text-2 leading-relaxed">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Users size={13} strokeWidth={2.5} />
                </span>
                <p>Every friend who signs up with your link and verifies their account earns you <strong className="text-text-1 font-semibold">10 FN Coins</strong>.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Ticket size={13} strokeWidth={2.5} />
                </span>
                <p>For every <strong className="text-text-1 font-semibold">10 verified referrals</strong>, at least <strong className="text-text-1 font-semibold">5</strong> of them need to register for an event through FestNest — this keeps the program genuine.</p>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={13} strokeWidth={2.5} />
                </span>
                <p>Once you've got <strong className="text-text-1 font-semibold">200 FN Coins</strong> and hit that milestone, a spin unlocks. Each milestone you complete unlocks another one — there's no cap.</p>
              </div>
              <p className="text-[13px] text-text-3 pt-1">
                Event registrations happen on the organiser's site, so we only count one once it's actually confirmed — not just because you clicked "Register."
              </p>
              <p className="text-[13px] text-text-3">
                FN Coins are separate from the Points you earn for hosting or registering for events elsewhere on FestNest — the two don't mix.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ============================================================================
// Spin status / CTA card
// ============================================================================

function SpinStatusCard({ summary, onOpenSpin }) {
  const spinsAvailable = (summary?.availableSpins ?? 0) > 0;
  const referralsNeeded = Math.max(0, (summary?.milestone?.referrals?.required ?? 10) - (summary?.milestone?.referrals?.count ?? 0));
  const registrationsNeeded = Math.max(0, (summary?.milestone?.eventRegistrations?.required ?? 5) - (summary?.milestone?.eventRegistrations?.count ?? 0));
  const coinsAvailable = summary?.fnCoins?.available ?? summary?.points?.available ?? 0;
  const coinsRequired = summary?.fnCoins?.required ?? summary?.points?.required ?? 200;
  const coinsNeeded = Math.max(0, coinsRequired - coinsAvailable);

  if (spinsAvailable) {
    return (
      <div
        className="rounded-lg p-5 border border-[#FDE68A] shadow-1 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEFCE8 100%)' }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="w-10 h-10 rounded-md bg-white border border-[#FDE68A] flex items-center justify-center shrink-0">
            <PartyPopper size={20} className="text-[#B45309]" strokeWidth={2} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#B45309] bg-white/70 border border-[#FDE68A] rounded-md px-2 py-1">
            {(summary?.availableSpins ?? 0)} spin{(summary?.availableSpins ?? 0) > 1 ? 's' : ''} ready
          </span>
        </div>
        <h3 className="font-heading font-bold text-[18px] text-text-1 mb-1">Your spin is ready</h3>
        <p className="text-[13px] text-text-2 mb-4">Give the wheel a spin — the reward is chosen the moment you tap it.</p>
        <button
          type="button"
          onClick={onOpenSpin}
          className="w-full px-4 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-md hover:bg-primary-dark hover:shadow-indigo transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles size={16} strokeWidth={2} />
          Spin now
        </button>
      </div>
    );
  }

  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="w-10 h-10 rounded-md bg-surface-3 flex items-center justify-center shrink-0">
          <Lock size={18} className="text-text-3" strokeWidth={2} />
        </span>
      </div>
      <h3 className="font-heading font-bold text-[16px] text-text-1 mb-1">Spin locked</h3>
      <p className="text-[13px] text-text-2 leading-relaxed mb-4">
        {buildLockedMessage({ referralsNeeded, registrationsNeeded, coinsNeeded })}
      </p>
      <button
        type="button"
        disabled
        className="w-full px-4 py-2.5 bg-surface-3 text-text-4 text-[14px] font-semibold rounded-md cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Lock size={14} strokeWidth={2} />
        Spin unavailable
      </button>
    </SectionCard>
  );
}

// ============================================================================
// Referral sharing card
// ============================================================================

function ReferralShareCard({ referralCode, referralLink }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — select the text so the user can copy manually.
      const input = document.getElementById('refer-link-input');
      if (input) {
        input.select();
        input.setSelectionRange(0, referralLink.length);
      }
    }
  }, [referralLink]);

  const shareText = `Join me on FestNest to discover hackathons, fests & workshops from colleges across India! ${referralLink}`;

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'FestNest', text: shareText, url: referralLink });
      } catch {
        // user cancelled — no action needed
      }
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <SectionCard>
      <h3 className="font-heading font-bold text-[16px] text-text-1 mb-1">Your referral link</h3>
      <p className="text-[13px] text-text-3 mb-4">Anyone who signs up through this link is permanently linked to you.</p>

      <div className="flex items-center gap-2 mb-3">
        <input
          id="refer-link-input"
          type="text"
          readOnly
          value={referralLink}
          className="flex-1 min-w-0 px-3 py-2.5 border-[1.5px] border-border-strong rounded-md text-[13px] text-text-2 bg-surface-2 truncate font-mono"
        />
        <button
          type="button"
          onClick={handleCopy}
          className={cx(
            'shrink-0 px-3 py-2.5 rounded-md text-[13px] font-semibold transition-all duration-150 active:scale-95 flex items-center gap-1.5',
            copied ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]' : 'bg-primary text-white hover:bg-primary-dark'
          )}
        >
          {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[12px] text-text-3">Referral code</span>
        <span className="font-mono font-bold text-[14px] text-primary tracking-wide">{referralCode}</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex-1 px-4 py-2.5 border-[1.5px] border-border-strong rounded-md text-[14px] font-medium text-text-2 hover:border-primary hover:text-primary transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
        >
          <MessageCircle size={16} strokeWidth={2} />
          WhatsApp
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 px-4 py-2.5 border-[1.5px] border-border-strong rounded-md text-[14px] font-medium text-text-2 hover:border-primary hover:text-primary transition-all duration-150 active:scale-95 flex items-center justify-center gap-2"
          >
            <Share2 size={16} strokeWidth={2} />
            Share
          </button>
        )}
      </div>
    </SectionCard>
  );
}

// ============================================================================
// History lists
// ============================================================================

function ReferralHistoryCard({ state, onLoadMore }) {
  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-[16px] text-text-1">Referral history</h3>
        <span className="text-[12px] text-text-3 font-mono">{state.items.length} shown</span>
      </div>

      {state.loading && state.items.length === 0 && (
        <div className="space-y-2">
          <InlineSkeleton className="h-12 w-full" />
          <InlineSkeleton className="h-12 w-full" />
          <InlineSkeleton className="h-12 w-full" />
        </div>
      )}

      {!state.loading && state.error && (
        <p className="text-[13px] text-[#DC2626] flex items-center gap-1.5">
          <AlertCircle size={14} /> Couldn't load your referrals right now.
        </p>
      )}

      {!state.loading && !state.error && state.items.length === 0 && (
        <div className="text-center py-8">
          <Users size={28} className="text-text-4 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-[14px] font-semibold text-text-1 mb-1">No referrals yet</p>
          <p className="text-[13px] text-text-3">Share your link above to get your first one.</p>
        </div>
      )}

      {state.items.length > 0 && (
        <div className="space-y-2">
          {state.items.map((r) => {
            const meta = REFERRAL_STATUS_META[r.status] || REFERRAL_STATUS_META.pending;
            const eventMeta = r.eventStatus && EVENT_STATUS_META[r.eventStatus] ? EVENT_STATUS_META[r.eventStatus] : null;
            return (
              <div key={r.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-text-1 truncate">{r.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] text-text-3 font-mono">{formatDate(r.date)}</span>
                    {eventMeta && eventMeta.Icon && (
                      <span className={cx('text-[12px] flex items-center gap-1', eventMeta.text)}>
                        <eventMeta.Icon size={11} strokeWidth={2.5} />
                        {eventMeta.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cx('text-[11px] font-semibold px-2 py-1 rounded-md border flex items-center gap-1', meta.bg, meta.text, meta.border)}>
                    <meta.Icon size={11} strokeWidth={2.5} />
                    {meta.label}
                  </span>
                  <span className="text-[13px] font-mono font-bold text-text-1 w-10 text-right">
                    {r.fnCoins > 0 ? `+${r.fnCoins}` : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {state.hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={state.loading}
          className="w-full mt-4 px-4 py-2 border-[1.5px] border-border-strong rounded-md text-[13px] font-medium text-text-2 hover:border-primary hover:text-primary transition-all duration-150"
        >
          {state.loading ? 'Loading…' : 'Show more'}
        </button>
      )}
    </SectionCard>
  );
}

function SpinHistoryCard({ state, onLoadMore }) {
  return (
    <SectionCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-[16px] text-text-1">Spin history</h3>
        <span className="text-[12px] text-text-3 font-mono">{state.items.length} shown</span>
      </div>

      {state.loading && state.items.length === 0 && (
        <div className="space-y-2">
          <InlineSkeleton className="h-12 w-full" />
          <InlineSkeleton className="h-12 w-full" />
        </div>
      )}

      {!state.loading && state.error && (
        <p className="text-[13px] text-[#DC2626] flex items-center gap-1.5">
          <AlertCircle size={14} /> Couldn't load your spin history right now.
        </p>
      )}

      {!state.loading && !state.error && state.items.length === 0 && (
        <div className="text-center py-8">
          <Trophy size={28} className="text-text-4 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-[14px] font-semibold text-text-1 mb-1">No spins yet</p>
          <p className="text-[13px] text-text-3">Your results will show up here once you spin.</p>
        </div>
      )}

      {state.items.length > 0 && (
        <div className="space-y-2">
          {state.items.map((s) => {
            const meta = SPIN_STATUS_META[s.status] || SPIN_STATUS_META.pending;
            return (
              <div key={s.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[12px] font-mono text-text-3 w-12 shrink-0">{formatDate(s.date)}</span>
                  <span className="text-[14px] font-medium text-text-1 truncate">{s.rewardLabel}</span>
                </div>
                <span className={cx('text-[11px] font-semibold px-2 py-1 rounded-md border shrink-0', meta.bg, meta.text, meta.border)}>
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {state.hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={state.loading}
          className="w-full mt-4 px-4 py-2 border-[1.5px] border-border-strong rounded-md text-[13px] font-medium text-text-2 hover:border-primary hover:text-primary transition-all duration-150"
        >
          {state.loading ? 'Loading…' : 'Show more'}
        </button>
      )}
    </SectionCard>
  );
}

// ============================================================================
// Spin Wheel
// ============================================================================

const WHEEL_SIZE = 300;
const WHEEL_RADIUS = 140;
const WHEEL_CENTER = WHEEL_SIZE / 2;

function SpinWheel({ segments, rotation, spinning, loading }) {
  const displaySegments = loading || segments.length === 0
    ? Array.from({ length: 8 }, (_, i) => ({ id: `placeholder-${i}`, label: '', type: 'none' }))
    : segments;
  const step = 360 / displaySegments.length;

  return (
    <div className="relative mx-auto" style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
      {/* Pointer */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-10" aria-hidden="true">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: '11px solid transparent',
            borderRight: '11px solid transparent',
            borderTop: '18px solid #3730A3',
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.25))',
          }}
        />
      </div>

      <motion.div
        className="w-full h-full rounded-full"
        style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.08)' }}
        animate={{ rotate: rotation }}
        transition={spinning ? { duration: 4, ease: [0.12, 0.67, 0.14, 1] } : { duration: 0 }}
      >
        <svg viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`} className="w-full h-full">
          <circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r={WHEEL_RADIUS + 4} fill="#fff" />
          {displaySegments.map((seg, i) => {
            const start = i * step;
            const end = (i + 1) * step;
            const fill = loading || segments.length === 0 ? (i % 2 === 0 ? '#F1F0ED' : '#E9E9E5') : WHEEL_COLORS[i % WHEEL_COLORS.length];
            return <path key={seg.id} d={describeWedge(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS, start, end)} fill={fill} stroke="#fff" strokeWidth="2" />;
          })}
        </svg>

        {!loading && segments.length > 0 && displaySegments.map((seg, i) => {
          const mid = i * step + step / 2;
          const pos = polarToCartesian(WHEEL_CENTER, WHEEL_CENTER, WHEEL_RADIUS * 0.62, mid);
          const RewardIcon = REWARD_TYPE_ICON[seg.type] || Star;
          return (
            <div
              key={seg.id}
              className="absolute flex flex-col items-center text-white pointer-events-none"
              style={{ left: `${(pos.x / WHEEL_SIZE) * 100}%`, top: `${(pos.y / WHEEL_SIZE) * 100}%`, transform: 'translate(-50%, -50%)', width: 64 }}
            >
              <RewardIcon size={16} strokeWidth={2} />
              <span className="text-[9px] font-bold text-center leading-tight mt-0.5 drop-shadow-sm">{seg.label}</span>
            </div>
          );
        })}
      </motion.div>

      {/* Center hub */}
      <div
        className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white border-[3px] border-primary flex items-center justify-center"
        style={{ boxShadow: '0 4px 14px rgba(79,70,229,0.25)' }}
      >
        {spinning ? (
          <Loader2 size={22} className="text-primary animate-spin" />
        ) : (
          <span className="font-heading font-bold text-[12px] text-primary tracking-wide">SPIN</span>
        )}
      </div>
    </div>
  );
}

function SpinModal({ open, onClose, segments, wheelLoading, rotation, spinning, spinResult, spinError, onSpin, canSpin }) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === 'Escape' && !spinning) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, spinning, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => !spinning && onClose()}
      >
        <motion.div
          className="w-full max-w-[420px] bg-white border border-border rounded-xl p-6 relative"
          style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.18)' }}
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {!spinning && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-text-2 hover:bg-surface-3 transition-colors duration-150"
            >
              <X size={18} />
            </button>
          )}

          <AnimatePresence mode="wait">
            {!spinResult ? (
              <motion.div key="wheel" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <h2 className="font-heading font-bold text-[18px] text-text-1 mb-1 text-center">Spin the wheel</h2>
                <p className="text-[13px] text-text-3 text-center mb-6">Your reward is decided the moment you spin.</p>

                <SpinWheel segments={segments} rotation={rotation} spinning={spinning} loading={wheelLoading} />

                {spinError && (
                  <p className="mt-4 text-[13px] text-[#DC2626] text-center flex items-center justify-center gap-1.5">
                    <AlertCircle size={14} /> {spinError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={onSpin}
                  disabled={spinning || wheelLoading || !canSpin}
                  className="w-full mt-6 px-4 py-3 bg-primary text-white text-[15px] font-semibold rounded-md hover:bg-primary-dark hover:shadow-indigo transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {spinning ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Spinning…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Spin now
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                className="text-center py-4 relative"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="absolute text-[#F59E0B]"
                    style={{ left: `${15 + i * 14}%`, top: i % 2 === 0 ? '10%' : '20%' }}
                    initial={{ opacity: 0, y: 0, scale: 0.4 }}
                    animate={{ opacity: [0, 1, 0], y: -24, scale: 1 }}
                    transition={{ duration: 1.1, delay: 0.15 + i * 0.06, ease: 'easeOut' }}
                  >
                    <Sparkles size={14} />
                  </motion.span>
                ))}

                <div className="w-16 h-16 rounded-full bg-[#FFFBEB] border-2 border-[#FDE68A] flex items-center justify-center mx-auto mb-4">
                  {React.createElement(REWARD_TYPE_ICON[spinResult.type] || Star, { size: 28, className: 'text-[#B45309]', strokeWidth: 2 })}
                </div>
                <h2 className="font-heading font-bold text-[20px] text-text-1 mb-1">{spinResult.label}</h2>
                <p className="text-[13px] text-text-3 mb-6 max-w-[280px] mx-auto">
                  {spinResult.type === 'cash'
                    ? "Cash rewards are reviewed before payout — track its status in your spin history."
                    : 'This has been added to your account.'}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-primary text-white text-[14px] font-semibold rounded-md hover:bg-primary-dark transition-all duration-150 active:scale-95"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// Main page
// ============================================================================

const PAGE_SIZE = 8;

export default function ReferAndEarn() {
  const { isLoggedIn, requireAuth } = useApp();

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  const [referralHistory, setReferralHistory] = useState({ items: [], hasMore: false, loading: true, error: null, page: 1 });
  const [spinHistory, setSpinHistory] = useState({ items: [], hasMore: false, loading: true, error: null, page: 1 });

  const [wheelSegments, setWheelSegments] = useState([]);
  const [wheelLoading, setWheelLoading] = useState(true);

  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState(null);
  const [spinError, setSpinError] = useState(null);

  const pendingKeyRef = useRef(null);

  const loadSummary = useCallback(async () => {
    if (!isLoggedIn) {
      setSummaryLoading(false);
      return;
    }
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const { data } = await api.get('/refer/summary');
      setSummary(data);
    } catch (err) {
      setSummaryError(err?.response?.data?.message || "Couldn't load your Refer & Earn stats.");
    } finally {
      setSummaryLoading(false);
    }
  }, [isLoggedIn]);

  const loadHistory = useCallback(async (type, page) => {
    if (!isLoggedIn) {
      const setter = type === 'referrals' ? setReferralHistory : setSpinHistory;
      setter((prev) => ({ ...prev, loading: false }));
      return;
    }
    const setter = type === 'referrals' ? setReferralHistory : setSpinHistory;
    setter((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data } = await api.get(`/refer/history?type=${type}&page=${page}&limit=${PAGE_SIZE}`);
      setter((prev) => ({
        items: page === 1 ? (data?.items || []) : [...prev.items, ...(data?.items || [])],
        hasMore: !!data?.hasMore,
        loading: false,
        error: null,
        page,
      }));
    } catch (err) {
      setter((prev) => ({ ...prev, loading: false, error: err?.response?.data?.message || 'Failed to load.' }));
    }
  }, [isLoggedIn]);

  const loadWheelConfig = useCallback(async () => {
    setWheelLoading(true);
    try {
      const { data } = await api.get('/refer/wheel-config');
      setWheelSegments(data?.segments || []);
    } catch {
      setWheelSegments([]);
    } finally {
      setWheelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setSummaryLoading(false);
      setReferralHistory((prev) => ({ ...prev, loading: false }));
      setSpinHistory((prev) => ({ ...prev, loading: false }));
      loadWheelConfig();
      return;
    }
    loadSummary();
    loadHistory('referrals', 1);
    loadHistory('spins', 1);
    loadWheelConfig();
  }, [isLoggedIn, loadSummary, loadHistory, loadWheelConfig]);

  const handleOpenSpin = () => {
    setSpinResult(null);
    setSpinError(null);
    setSpinModalOpen(true);
  };

  const handleCloseSpin = () => {
    if (spinning) return;
    setSpinModalOpen(false);
    setSpinResult(null);
    setSpinError(null);
  };

  const handleSpin = useCallback(async () => {
    if (spinning || wheelSegments.length === 0) return;
    if (!pendingKeyRef.current) pendingKeyRef.current = makeIdempotencyKey();

    setSpinning(true);
    setSpinError(null);

    try {
      const { data } = await api.post('/refer/spin', { idempotencyKey: pendingKeyRef.current });
      pendingKeyRef.current = null;

      const step = 360 / wheelSegments.length;
      const winningIndex = Math.max(0, wheelSegments.findIndex((s) => s.id === data.winningSegmentId));
      const wedgeCenter = winningIndex * step + step / 2;
      const extraSpins = 5 * 360;
      const alignment = (360 - wedgeCenter) % 360;
      const currentMod = ((rotation % 360) + 360) % 360;
      const delta = extraSpins + ((alignment - currentMod + 360) % 360);
      setRotation((r) => r + delta);

      // Reveal the result once the wheel visually finishes spinning.
      setTimeout(() => {
        setSpinning(false);
        setSpinResult(data?.reward);
        loadSummary();
        loadHistory('spins', 1);
        loadHistory('referrals', 1);
      }, 4050);
    } catch (err) {
      const code = err?.response?.data?.code || err?.code;
      if (code === 'NOT_ELIGIBLE' || code === 'NO_SPINS_LEFT') pendingKeyRef.current = null;
      setSpinError(err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.');
      setSpinning(false);
    }
  }, [spinning, wheelSegments, rotation, loadSummary, loadHistory]);

  return (
    <ErrorBoundary>
      <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-6 md:py-10 pb-16">
        <Helmet>
          <title>Refer &amp; Earn — FestNest</title>
          <meta name="description" content="Refer friends to FestNest, earn FN Coins, and spin the wheel for rewards." />
        </Helmet>

        {/* Hero */}
        <div className="mb-6 md:mb-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-primary bg-primary-light px-2.5 py-1 rounded-md mb-3">
            <Gift size={12} strokeWidth={2.5} />
            Refer &amp; Earn
          </span>
          <h1 className="font-heading font-bold text-[26px] md:text-[32px] text-text-1 tracking-tight leading-tight mb-2">
            Bring your friends to FestNest, earn your way to a spin
          </h1>
          <p className="text-[14px] md:text-[15px] text-text-2 max-w-[560px]">
            Ten FN Coins a referral, a spin of the wheel once you and your friends hit the milestone. Every reward is decided the moment you spin — nothing is guaranteed in advance.
          </p>
        </div>

        {!isLoggedIn && (
          <SectionCard className="mb-6 text-center py-12">
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary mx-auto mb-3">
              <Gift size={24} strokeWidth={2} />
            </div>
            <h2 className="font-heading font-bold text-lg text-text-1 mb-1">Sign in to start referring</h2>
            <p className="text-sm text-text-3 max-w-sm mx-auto mb-5">
              Log in or create a FestNest account to get your personal referral link, invite friends, and unlock spins for real rewards.
            </p>
            <button
              type="button"
              onClick={requireAuth}
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-all duration-150 active:scale-95 shadow-sm"
            >
              Sign In / Sign Up
            </button>
          </SectionCard>
        )}

        {summaryError && !summaryLoading && (
          <SectionCard className="mb-6 text-center py-10">
            <AlertCircle size={28} className="text-[#DC2626] mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-text-1 mb-1">{summaryError}</p>
            <button
              type="button"
              onClick={loadSummary}
              className="mt-3 px-4 py-2 bg-primary text-white text-[13px] font-semibold rounded-md hover:bg-primary-dark transition-all duration-150"
            >
              Try again
            </button>
          </SectionCard>
        )}

        {isLoggedIn && (summaryLoading || summary) && (
          <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 items-start">
            {/* Sidebar content — appears first on mobile, right column on desktop */}
            <div className="lg:order-2 space-y-4 mb-6 lg:mb-0">
              {summaryLoading ? (
                <>
                  <InlineSkeleton className="h-28 w-full" />
                  <InlineSkeleton className="h-28 w-full" />
                  <InlineSkeleton className="h-40 w-full" />
                </>
              ) : (
                <>
                  <StatCard
                    icon={Coins}
                    label="FN Coins"
                    current={summary?.fnCoins?.available ?? summary?.points?.available ?? 0}
                    target={summary?.fnCoins?.required ?? summary?.points?.required ?? 200}
                    suffix=""
                    tone="primary"
                  />
                  <StatCard
                    icon={Users}
                    label="Referrals (this milestone)"
                    current={summary?.milestone?.referrals?.count ?? 0}
                    target={summary?.milestone?.referrals?.required ?? 10}
                    suffix=""
                    tone="primary"
                  />
                  <StatCard
                    icon={Ticket}
                    label="Event registrations"
                    current={summary?.milestone?.eventRegistrations?.count ?? 0}
                    target={summary?.milestone?.eventRegistrations?.required ?? 5}
                    suffix=""
                    tone="amber"
                  />
                  <div className="lg:sticky lg:top-24">
                    <SpinStatusCard summary={summary} onOpenSpin={handleOpenSpin} />
                  </div>
                </>
              )}
            </div>

            {/* Main column */}
            <div className="lg:order-1 space-y-4">
              <HowItWorksPanel />
              {summary && <ReferralShareCard referralCode={summary?.referralCode || ''} referralLink={summary?.referralLink || ''} />}
              <ReferralHistoryCard state={referralHistory} onLoadMore={() => loadHistory('referrals', referralHistory.page + 1)} />
              <SpinHistoryCard state={spinHistory} onLoadMore={() => loadHistory('spins', spinHistory.page + 1)} />

              <p className="text-[12px] text-text-3 flex items-start gap-1.5 pt-2">
                <HelpCircle size={13} className="shrink-0 mt-0.5" />
                Rewards are subject to FestNest's Refer &amp; Earn program terms. Cash rewards are reviewed before payout and aren't guaranteed instantly.
                <a href="/terms" className="text-primary hover:underline inline-flex items-center gap-0.5 shrink-0">
                  Read the terms <ArrowUpRight size={11} />
                </a>
              </p>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="space-y-4">
            <HowItWorksPanel />
            <p className="text-[12px] text-text-3 flex items-start gap-1.5 pt-2">
              <HelpCircle size={13} className="shrink-0 mt-0.5" />
              Rewards are subject to FestNest's Refer &amp; Earn program terms. Cash rewards are reviewed before payout and aren't guaranteed instantly.
              <a href="/terms" className="text-primary hover:underline inline-flex items-center gap-0.5 shrink-0">
                Read the terms <ArrowUpRight size={11} />
              </a>
            </p>
          </div>
        )}

        <SpinModal
          open={spinModalOpen}
          onClose={handleCloseSpin}
          segments={wheelSegments}
          wheelLoading={wheelLoading}
          rotation={rotation}
          spinning={spinning}
          spinResult={spinResult}
          spinError={spinError}
          onSpin={handleSpin}
          canSpin={!!summary && (summary?.availableSpins ?? 0) > 0}
        />
      </div>
    </ErrorBoundary>
  );
}
