import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useNavigationType, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, AlertTriangle, HelpCircle, CalendarDays, Clock, MapPin,
  Monitor, Globe, Building2, Trophy, IndianRupee, Gift, Phone,
  FileText, Download, Bookmark, Share2, CheckCircle2,
  ChevronLeft, ChevronRight, X, ExternalLink, Mail, UserRound, Sparkles,
  ArrowRight, Award, Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { events as eventsApi } from '../services/api';
import { normaliseEvent, normaliseEvents } from '../services/normalise';
import { CompetitionManager } from './organizer/OrganizerDashboard';
import Seo, { SITE_URL, DEFAULT_OG_IMAGE } from '../components/Seo';
import { sanitizeText } from '../utils/sanitize';

const toIsoDate = (raw) => {
  if (!raw) return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? raw : d.toISOString();
};

function buildEventJsonLd(ev, canonicalUrl, description) {
  const attendanceMode =
    ev.mode === 'Online' ? 'https://schema.org/OnlineEventAttendanceMode'
    : ev.mode === 'Hybrid' ? 'https://schema.org/MixedEventAttendanceMode'
    : 'https://schema.org/OfflineEventAttendanceMode';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.name,
    description,
    image: [ev.imageUrl || DEFAULT_OG_IMAGE],
    eventAttendanceMode: attendanceMode,
    eventStatus: 'https://schema.org/EventScheduled',
    url: canonicalUrl,
    organizer: {
      '@type': 'Organization',
      name: ev.orgName || ev.college,
    },
    location: ev.mode === 'Online'
      ? { '@type': 'VirtualLocation', url: ev.website || canonicalUrl }
      : {
          '@type': 'Place',
          name: ev.venue || ev.college,
          address: {
            '@type': 'PostalAddress',
            addressLocality: ev.city,
            addressCountry: 'IN',
          },
        },
  };

  const start = toIsoDate(ev.startDate);
  if (start) data.startDate = start;
  const end = toIsoDate(ev.endDate);
  if (end) data.endDate = end;

  if (ev.entryType === 'free' || ev.entryType === 'prize') {
    data.offers = {
      '@type': 'Offer', price: '0', priceCurrency: 'INR',
      availability: 'https://schema.org/InStock', url: canonicalUrl,
    };
  } else {
    const num = String(ev.price || '').replace(/[^0-9.]/g, '');
    if (num) {
      data.offers = {
        '@type': 'Offer', price: num, priceCurrency: 'INR',
        availability: 'https://schema.org/InStock', url: canonicalUrl,
      };
    }
  }
  return data;
}

const isValidExternalUrl = (raw) => {
  if (!raw || raw === '#') return false;
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const openExternalRegistrationLink = (raw) => {
  if (!isValidExternalUrl(raw)) return false;
  window.location.assign(raw);
  return true;
};

const normaliseMultilineText = (text) =>
  String(text || '')
    .replace(/\r\n/g, '\n')
    .trim();

function MultilineText({ text, className = '' }) {
  const content = normaliseMultilineText(text);
  if (!content) return null;
  const blocks = content
    .split(/\n\s*\n+/)
    .map(block => block.trimEnd())
    .filter(Boolean);
  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {blocks.map((block, index) => (
        <p key={index} className="m-0 whitespace-pre-wrap break-words leading-relaxed">
          {block}
        </p>
      ))}
    </div>
  );
}

const ENTRY_CONFIG = {
  free:  { label: 'Register Free', color: 'bg-[#16A34A] hover:bg-[#15803D]', shadow: 'hover:shadow-[0_4px_14px_rgba(22,163,74,0.35)]',  pill: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' },
  paid:  { label: 'Book Tickets',  color: 'bg-primary hover:bg-primary-dark', shadow: 'hover:shadow-indigo', pill: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' },
  prize: { label: 'Register Now',  color: 'bg-primary hover:bg-primary-dark', shadow: 'hover:shadow-indigo', pill: 'bg-primary-light text-primary border-[#C7D2FE]' },
};

const DetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Hero Skeleton (Light Theme) */}
      <div className="w-full bg-[#FAFAF9] border-b border-border pt-6 pb-12 md:pb-16 px-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Breadcrumb Skeleton */}
          <div className="skeleton h-4 w-44 mb-6 rounded" />

          {/* Two-Column Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-center gap-8 lg:gap-12">
            {/* Left Column */}
            <div className="flex flex-col items-start min-w-0 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2.5 mb-1">
                <div className="skeleton h-6 w-28 rounded-full" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>

              {/* Title */}
              <div className="space-y-2.5 w-full">
                <div className="skeleton h-9 sm:h-11 w-3/4 rounded-lg" />
                <div className="skeleton h-9 sm:h-11 w-1/2 rounded-lg" />
              </div>

              {/* Subtitle / Host */}
              <div className="skeleton h-4 w-60 rounded" />

              {/* Description */}
              <div className="space-y-2 w-full max-w-xl pt-1">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-5/6 rounded" />
                <div className="skeleton h-4 w-4/6 rounded" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="skeleton h-12 w-36 rounded-lg" />
                <div className="skeleton h-12 w-24 rounded-lg" />
                <div className="skeleton h-12 w-24 rounded-lg" />
              </div>
            </div>

            {/* Right Column: Poster */}
            <div className="w-full">
              <div className="skeleton aspect-[16/10] w-full rounded-2xl border border-border" />
            </div>
          </div>
        </div>
      </div>

      {/* 7-Column Information Strip Skeleton */}
      <div className="w-full border-b border-border bg-white overflow-x-auto no-scrollbar shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-[1280px] flex divide-x divide-border min-w-max">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="flex items-start gap-2.5 px-5 py-4 min-w-[130px]">
              <div className="skeleton w-4 h-4 rounded-full flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <div className="skeleton h-2.5 w-12 rounded" />
                <div className="skeleton h-3.5 w-20 rounded" />
                <div className="skeleton h-2.5 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Section Nav Skeleton */}
      <div className="border-b border-border bg-white/95 px-4 sm:px-6 md:px-8 py-2.5 mb-7">
        <div className="mx-auto max-w-[1280px] flex gap-2 overflow-x-auto no-scrollbar">
          {[80, 70, 110, 75, 65, 90, 80].map((w, i) => (
            <div key={i} className="skeleton h-8 rounded-lg flex-shrink-0" style={{ width: `${w}px` }} />
          ))}
        </div>
      </div>

      {/* Main Content + Sidebar Grid Skeleton */}
      <div className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 md:px-8 lg:grid lg:grid-cols-[1fr_360px] lg:gap-9 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-8 min-w-0 w-full">
          {/* Mobile Ticket Card Placeholder */}
          <div className="lg:hidden rounded-xl border border-border bg-white p-5 space-y-4 shadow-sm">
            <div className="skeleton h-28 w-full rounded-lg" />
            <div className="skeleton h-12 w-full rounded-lg" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <div className="skeleton h-7 w-20 rounded-full" />
            <div className="skeleton h-7 w-24 rounded-full" />
            <div className="skeleton h-7 w-16 rounded-full" />
          </div>

          {/* About Section */}
          <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-sm space-y-3">
            <div className="skeleton h-6 w-44 rounded-md mb-4" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
          </div>

          {/* Competitions Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="skeleton h-6 w-36 rounded-md" />
              <div className="flex gap-2">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="skeleton w-8 h-8 rounded-full" />
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-[270px] sm:w-[290px] flex-shrink-0 rounded-xl border border-border bg-white p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="skeleton h-5 w-20 rounded" />
                    <div className="skeleton h-7 w-7 rounded" />
                  </div>
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-3.5 w-full rounded" />
                  <div className="skeleton h-3.5 w-2/3 rounded" />
                  <div className="skeleton h-2 w-full rounded-full mt-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Prizes & Perks Section */}
          <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="skeleton h-6 w-36 rounded-md mb-2" />
            <div className="skeleton h-16 w-full rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Desktop Sticky Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:gap-6 sticky top-[84px]">
          {/* Ticket Card */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
            <div className="p-5 bg-surface-2 border-b border-border space-y-3">
              <div className="skeleton h-5 w-40 rounded" />
              <div className="grid grid-cols-4 gap-2">
                <div className="skeleton h-14 rounded-lg" />
                <div className="skeleton h-14 rounded-lg" />
                <div className="skeleton h-14 rounded-lg" />
                <div className="skeleton h-14 rounded-lg" />
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="skeleton h-8 w-28 rounded" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
              <div className="skeleton h-12 w-full rounded-lg mt-2" />
              <div className="flex gap-2">
                <div className="skeleton h-10 flex-1 rounded-lg" />
                <div className="skeleton h-10 flex-1 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Featured Event Card */}
          <div className="rounded-xl border border-border bg-white p-4 space-y-3 shadow-sm">
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-32 w-full rounded-lg" />
            <div className="skeleton h-5 w-3/4 rounded" />
            <div className="skeleton h-4 w-1/2 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeading = ({ children, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-heading font-bold text-[20px] sm:text-[22px] text-text-1 tracking-tight">{children}</h2>
    {action && <div>{action}</div>}
  </div>
);

const competitionValue = value => String(value || '').trim();

function CompetitionDetails({ competition, index, onClose }) {
  const rows = [
    ['Eligibility', competition.eligibility],
    ['Format', competition.format],
    ['Team Size', competition.teamSize],
    ['Registration Fee', competition.registrationFee || 'Free'],
    ['Prize Details', competition.prizeDetails],
    ['Venue', competition.venue],
    ['Duration / Match Format', competition.duration],
  ].filter(([, value]) => competitionValue(value));

  return (
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 md:items-center md:p-5"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      role="presentation">
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.18)] md:max-w-[560px] md:rounded-xl md:shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
        role="dialog" aria-modal="true" aria-labelledby="competition-dialog-title">
        <div className="flex-shrink-0 border-b border-border px-5 pb-4 pt-3 md:pt-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#CBCBC6] md:hidden" />
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-[13px] font-bold text-primary">{index + 1}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Competition details</div>
              <h3 id="competition-dialog-title" className="mt-1 font-heading text-[20px] font-bold leading-tight text-text-1">{competition.name}</h3>
            </div>
            <button type="button" onClick={onClose} aria-label="Close competition details"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-surface-2 text-text-2 hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {competition.description && <MultilineText text={sanitizeText(competition.description)} className="mb-5 text-[14px] text-text-2" />}
          <div className="divide-y divide-border rounded-lg border border-border">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-5 px-4 py-3 text-[13px]">
                <span className="font-semibold text-text-3">{label}</span>
                <span className="max-w-[62%] text-right font-semibold leading-snug text-text-1">{sanitizeText(value)}</span>
              </div>
            ))}
          </div>
          {competition.rules && (
            <div className="mt-5">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-4">Additional details / rules</div>
              <MultilineText text={sanitizeText(competition.rules)} className="text-[14px] text-text-2" />
            </div>
          )}
          {isValidExternalUrl(competition.registrationLink) && (
            <button type="button" onClick={() => openExternalRegistrationLink(competition.registrationLink)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-[14px] font-bold text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              Register for this competition <ExternalLink size={15} />
            </button>
          )}
        </div>
        <div className="flex-shrink-0 border-t border-border bg-white px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] md:pb-3">
          <button type="button" onClick={onClose} className="w-full rounded-md border-[1.5px] border-border py-2.5 text-[13px] font-semibold text-text-2 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const PrizePodium = ({ prizes }) => {
  const { first, second, third } = prizes;
  if (!first && !second && !third) return null;
  const podium = [
    { rankLabel: '1st', label: '1st Prize', value: first,  bg: 'bg-[#FFFBEB] border-[#FDE68A]', text: 'text-[#B45309]' },
    { rankLabel: '2nd', label: '2nd Prize', value: second, bg: 'bg-[#F8FAFC] border-[#CBD5E1]', text: 'text-[#475569]' },
    { rankLabel: '3rd', label: '3rd Prize', value: third,  bg: 'bg-[#FFF7ED] border-[#FED7AA]', text: 'text-[#9A3412]' },
  ].filter(p => p.value);

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-3">Prize Breakdown</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {podium.map(({ rankLabel, label, value, bg, text }) => (
          <div key={label} className={`border rounded-lg p-3 sm:p-4 text-center ${bg}`}>
            <div className={`text-[13px] sm:text-[14px] font-bold mb-0.5 ${text}`}>{rankLabel}</div>
            <div className={`font-mono font-bold text-[16px] sm:text-[18px] ${text}`}>₹{Number(String(value).replace(/,/g,'')).toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-text-3 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

function SectionNav({ items, activeId }) {
  return (
    <nav aria-label="Event sections" className="sticky top-0 z-30 mb-7 border-b border-border bg-white/95 backdrop-blur-md md:top-[64px] w-full max-w-full overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex max-w-[1280px] items-center gap-1.5 overflow-x-auto px-4 py-2.5 flex-nowrap no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-8">
        {items.map(item => {
          const id = item.toLowerCase();
          const isActive = activeId === id;
          return (
            <a
              key={item}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(id);
                if (el) {
                  const offset = window.innerWidth >= 768 ? 140 : 80;
                  const y = el.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              className={`flex-shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-[13px] font-semibold transition-all duration-fast flex items-center justify-center min-h-[36px] select-none ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-3 hover:bg-primary-light hover:text-primary active:bg-primary-light'
              }`}
            >
              {item}
            </a>
          );
        })}
        <div className="w-4 flex-shrink-0" aria-hidden="true" />
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════
   COUNTDOWN & DATE PARSING HELPERS (IST Timezone)
══════════════════════════════════════════════════════ */
const INDIA_OFFSET = (5 * 60 + 30) * 60 * 1000;

export function parseDateIST(str, timeStr) {
  if (!str) return null;
  const strTrim = String(str).trim();

  // 1. ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const isoMatch = strTrim.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  let year, month, day;
  let hours = 23, minutes = 59, seconds = 59;

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]) - 1;
    day = Number(isoMatch[3]);
    if (isoMatch[4] !== undefined) {
      hours = Number(isoMatch[4]);
      minutes = Number(isoMatch[5] || 0);
      seconds = Number(isoMatch[6] || 0);
      return new Date(Date.UTC(year, month, day, hours, minutes, seconds) - INDIA_OFFSET);
    }
  } else {
    // 2. Date ranges or human-readable formats: "18–19 May 2025", "18-19 May 2025", "18 Oct 2026"
    const rangeMatch = strTrim.match(/^(\d{1,2})(?:[\s\u2013\u2014\-]+(\d{1,2}))?\s+([A-Za-z]+)(?:\s+(\d{4}))?/);
    if (rangeMatch) {
      day = Number(rangeMatch[1]);
      const monthDate = new Date(rangeMatch[3] + ' 1, 2000');
      if (isNaN(monthDate.getTime())) return null;
      month = monthDate.getMonth();
      year = rangeMatch[4] ? Number(rangeMatch[4]) : new Date().getFullYear();
    } else {
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d;
      return null;
    }
  }

  // Parse time if supplied (e.g. "9:00 AM onwards", "10:00 AM – 11:00 PM", "18:00")
  if (timeStr) {
    const timeMatch = String(timeStr).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = Number(timeMatch[1]);
      const m = timeMatch[2] ? Number(timeMatch[2]) : 0;
      const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      hours = h;
      minutes = m;
      seconds = 0;
    }
  }

  const utcMillis = Date.UTC(year, month, day, hours, minutes, seconds) - INDIA_OFFSET;
  return new Date(utcMillis);
}

export function getEventDeadline(ev) {
  if (!ev) return null;
  const now = Date.now();

  // 1. Explicit registration deadline / deadline field
  const explicit = ev.registrationDeadline || ev.deadline || ev.date?.deadline || ev.deadlineDate;
  if (explicit) {
    const p = parseDateIST(explicit, ev.time);
    if (p) return p;
  }

  // 2. Start date if in the future
  const startRaw = ev.date?.start || ev.rawStartDate || ev.startDate || '';
  const parsedStart = parseDateIST(startRaw, ev.time);

  if (parsedStart && parsedStart.getTime() > now) {
    return parsedStart;
  }

  // 3. deadlineDays (positive number of days until closing)
  const deadlineDays = typeof ev.deadlineDays === 'number'
    ? ev.deadlineDays
    : typeof ev.date?.deadlineDays === 'number'
    ? ev.date.deadlineDays
    : null;

  if (deadlineDays !== null && deadlineDays > 0) {
    const nowIST = new Date(now + INDIA_OFFSET);
    const targetYear = nowIST.getUTCFullYear();
    const targetMonth = nowIST.getUTCMonth();
    const targetDate = nowIST.getUTCDate() + deadlineDays;

    let hours = 23, minutes = 59, seconds = 59;
    if (ev.time) {
      const timeMatch = String(ev.time).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (timeMatch) {
        let h = Number(timeMatch[1]);
        const m = timeMatch[2] ? Number(timeMatch[2]) : 0;
        const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
        if (ampm === 'pm' && h < 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
        hours = h;
        minutes = m;
        seconds = 0;
      }
    }
    const utcMillis = Date.UTC(targetYear, targetMonth, targetDate, hours, minutes, seconds) - INDIA_OFFSET;
    return new Date(utcMillis);
  }

  // 4. If parsedStart exists but is in the past and deadlineDays <= 0
  if (parsedStart) return parsedStart;

  // 5. Fallback to end date if available
  const endRaw = ev.date?.end || ev.rawEndDate || ev.endDate || '';
  const parsedEnd = parseDateIST(endRaw, ev.time);
  if (parsedEnd) return parsedEnd;

  return null;
}

function calculateRemaining(target) {
  if (!target) return { d: 0, h: 0, m: 0, s: 0, isExpired: true, totalSeconds: 0 };
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, isExpired: true, totalSeconds: 0 };

  const totalSeconds = Math.floor(diff / 1000);
  return {
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
    isExpired: false,
    totalSeconds,
  };
}

function useCountdown(ev) {
  const [remaining, setRemaining] = useState(() => {
    const target = getEventDeadline(ev);
    return calculateRemaining(target);
  });

  useEffect(() => {
    const target = getEventDeadline(ev);
    setRemaining(calculateRemaining(target));

    if (!target) return;
    if (target.getTime() <= Date.now()) return;

    const tick = () => {
      const rem = calculateRemaining(target);
      setRemaining(rem);
      if (rem.isExpired) {
        clearInterval(timerId);
      }
    };

    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [ev?.slug, ev?.id, ev?.startDate, ev?.date?.start, ev?.deadlineDays, ev?.time]);

  return remaining;
}

/* ══════════════════════════════════════════════════════
   REUSABLE TICKET & COUNTDOWN CARD (Mobile & Desktop)
══════════════════════════════════════════════════════ */
function TicketCountdownCard({
  ev,
  cfg,
  countdown,
  registering,
  registered,
  isSaved,
  onToggleSave,
  handleRegister,
  showToast,
  isMobile = false,
}) {
  const isExpired = countdown?.isExpired;

  return (
    <div className={`rounded-xl border border-border bg-white overflow-hidden ${
      isMobile ? 'shadow-md' : 'shadow-[0_4px_24px_rgba(0,0,0,0.06)]'
    }`}>
      {/* Dark Countdown Header */}
      <div className="bg-[#0B0819] text-white p-5 relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
        <h3 className="font-heading font-bold text-[18px] mb-3 text-white">
          {isExpired ? 'Registration Closed' : 'Book Your Tickets'}
        </h3>

        {/* 4 Countdown Boxes */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { v: countdown?.d ?? 0,  l: 'DAYS' },
            { v: countdown?.h ?? 0,  l: 'HRS' },
            { v: countdown?.m ?? 0,  l: 'MINS' },
            { v: countdown?.s ?? 0,  l: 'SECS' },
          ].map(({ v, l }) => (
            <div key={l} className="bg-white/10 rounded-lg py-2.5 text-center border border-white/10">
              <div className="font-mono font-black text-[22px] leading-none text-white tabular-nums">
                {String(v).padStart(2, '0')}
              </div>
              <div className="text-[8px] font-mono tracking-wider text-white/50 mt-1">{l}</div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-center min-h-[16px]">
          {isExpired ? (
            <span className="text-rose-300 font-semibold flex items-center justify-center gap-1.5">
              <Clock size={13} /> Registration has ended
            </span>
          ) : countdown && !countdown.isExpired ? (
            <span className="text-white/60">
              Registration closes in {countdown.d}d {countdown.h}h {countdown.m}m {countdown.s}s
            </span>
          ) : (
            <span className="text-white/60">Registration closing soon</span>
          )}
        </div>
      </div>

      {/* White Body */}
      <div className="p-5 space-y-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-4">Entry Fee</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-mono font-bold text-[28px] text-text-1">{ev.price || 'Free'}</span>
            <span className="text-[13px] text-text-3">/ team</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-border text-[13px] text-text-2">
          <div className="flex items-start gap-2.5">
            <CalendarDays size={15} className="text-primary flex-shrink-0 mt-0.5" />
            <span>{ev.startDate || 'TBA'} {ev.endDate ? `to ${ev.endDate}` : ''}</span>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin size={15} className="text-primary flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{ev.venue || ev.college}, {ev.city}</span>
          </div>
        </div>

        {/* Primary Action Button */}
        <motion.button
          whileHover={!isExpired && !registering && !registered ? { scale: 1.01 } : {}}
          whileTap={!isExpired && !registering && !registered ? { scale: 0.97 } : {}}
          onClick={handleRegister}
          disabled={registering || registered || isExpired}
          className={`w-full py-3.5 rounded-lg font-sans text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all duration-fast disabled:opacity-75 ${
            registered
              ? 'bg-[#16A34A]'
              : isExpired
              ? 'bg-zinc-600 cursor-not-allowed shadow-none'
              : `${cfg?.color || 'bg-primary hover:bg-primary-dark'} shadow-indigo`
          }`}
        >
          {registering ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          ) : registered ? (
            <>
              <CheckCircle2 size={17} /> Registered!
            </>
          ) : isExpired ? (
            <>Registration Closed</>
          ) : (
            <>
              {cfg?.label || 'Book Tickets'} <ArrowRight size={16} />
            </>
          )}
        </motion.button>

        {/* Secondary Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onToggleSave}
            className={`flex-1 py-2.5 rounded-lg border text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isSaved ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-2 hover:border-primary hover:text-primary'
            }`}
          >
            <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: ev?.name, url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                showToast('Link copied! 📋', 'success');
              }
            }}
            className="flex-1 py-2.5 rounded-lg border border-border text-[13px] font-semibold text-text-2 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5"
          >
            <Share2 size={15} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventDetails() {
  const { id }   = useParams();
  const navigate     = useNavigate();
  const navType      = useNavigationType();
  const { savedEvents, toggleSave, showToast, requireAuth, currentUser } = useApp();

  const [ev,            setEv]            = useState(null);
  const [related,       setRelated]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [registering,   setRegistering]   = useState(false);
  const [registered,    setRegistered]    = useState(false);
  const [followed,      setFollowed]      = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [showFullRules, setShowFullRules] = useState(false);
  const [showPrizeBreakdown, setShowPrizeBreakdown] = useState(false);
  const [serverSaved,   setServerSaved]   = useState(null);
  const [userToggled,   setUserToggled]   = useState(false);
  const [featuredEvs,     setFeaturedEvs]     = useState([]);
  const [, setFeaturedLoading] = useState(true);
  const [lightboxOpen,    setLightboxOpen]    = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [activeSection,  setActiveSection] = useState('overview');

  const heroRef = useRef(null);
  const competitionsScrollRef = useRef(null);
  const relatedScrollRef = useRef(null);

  // --- Section refs for IntersectionObserver ---
  const sectionRefs = useRef({});
  const setSectionRef = useCallback((sId) => (el) => {
    if (el) sectionRefs.current[sId] = el;
  }, []);

  useEffect(() => {
    const refs = sectionRefs.current;
    const entries = Object.entries(refs);
    if (!entries.length) return;

    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    entries.forEach(([, el]) => observer.observe(el));
    return () => observer.disconnect();
  });

  /* Fetch featured events */
  useEffect(() => {
    setFeaturedEvs([]);
    setFeaturedLoading(true);
    eventsApi.featured()
      .then(r => setFeaturedEvs(
        normaliseEvents(r.data?.events || []).filter(f => (f.slug || f.id) !== id)
      ))
      .catch(err => {
        if (import.meta.env.DEV) console.error('[EventDetails] featured fetch failed:', err);
      })
      .finally(() => setFeaturedLoading(false));
  }, [id]);

  /* Fetch event */
  useEffect(() => {
    setLoading(true); setError(null); setEv(null); setRelated([]); setServerSaved(null);
    eventsApi.get(id)
      .then(r => {
        setEv(normaliseEvent(r.data.event));
        setRelated(normaliseEvents(r.data.related || []));
        if (typeof r.data.isSaved === 'boolean') setServerSaved(r.data.isSaved);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  /* Close image lightbox on Escape */
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightboxOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  useEffect(() => {
    if (selectedCompetition === null) return;
    const onKey = e => { if (e.key === 'Escape') setSelectedCompetition(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedCompetition]);

  const isSaved = userToggled
    ? savedEvents.has(id)
    : (savedEvents.has(id) || serverSaved === true);
  const cfg     = ev ? (ENTRY_CONFIG[ev.entryType] || ENTRY_CONFIG.prize) : null;

  // Real-time dynamic countdown
  const countdown = useCountdown(ev);

  const ownerId = typeof ev?.hostedBy === 'object' ? ev?.hostedBy?._id : ev?.hostedBy;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isLiveEvent = ev?.isActive !== false && ev?.isApproved !== false;
  const isExpired = countdown?.isExpired || !isLiveEvent;

  const handleRegister = async () => {
    if (registered || isExpired) return;
    if (!requireAuth()) return;
    const registrationLink = ev?.registrationUrl || ev?.website || '';
    if (openExternalRegistrationLink(registrationLink)) return;
    setRegistering(true);
    try {
      await eventsApi.register(id);
      setRegistered(true);
      showToast(`You're registered for ${ev.name}! ✓`, 'success');
    } catch (e) {
      if (e.message?.toLowerCase().includes('already')) {
        setRegistered(true);
        showToast(`Already registered for ${ev.name} ✓`, 'success');
      } else {
        showToast(e.message || 'Registration failed', 'error');
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDownloadBrochure = async () => {
    const url = ev?.brochureUrl;
    if (!url) return;
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href     = blobUrl;
      a.download = `${(ev.name || 'event').replace(/[^a-z0-9]/gi, '-')}-brochure.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const amount = direction === 'left' ? -320 : 320;
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !ev) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <Seo title={error ? 'Could not load event' : 'Event not found'} noindex />
      {error ? <AlertTriangle size={72} strokeWidth={1.3} className="text-amber mb-4" /> : <HelpCircle size={72} strokeWidth={1.3} className="text-text-3 mb-4" />}
      <h2 className="font-heading font-bold text-[22px] text-text-1 tracking-tight mb-2">
        {error ? 'Could not load event' : 'Event not found'}
      </h2>
      <p className="text-[14px] text-text-3 mb-6">{error || 'This event may have ended or been removed.'}</p>
      <div className="flex gap-3">
        {error && <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-white rounded-md text-[14px] font-semibold hover:bg-primary-dark transition-colors">Retry</button>}
        <button onClick={() => navigate('/')} className="px-6 py-3 border border-border text-text-2 rounded-md text-[14px] font-semibold hover:border-primary hover:text-primary transition-colors">← Back to Home</button>
      </div>
    </div>
  );

  // --- Derived values ---
  const safeAbout  = sanitizeText(ev.about || '');
  const aboutShort = safeAbout.slice(0, 300);
  const prizes = {
    first:  ev.prize1  || ev.prizeFirst  || '',
    second: ev.prize2  || ev.prizeSecond || '',
    third:  ev.prize3  || ev.prizeThird  || '',
    total:  ev.totalPrize || '',
    pool:   ev.prizeDetails || '',
  };
  const computedSum = [prizes.first, prizes.second, prizes.third]
    .map(p => Number(String(p).replace(/[^0-9.]/g, '')))
    .filter(n => !isNaN(n) && n > 0)
    .reduce((a, b) => a + b, 0);

  const displayTotalPrize = prizes.total
    ? String(prizes.total).replace(/^₹\s*/, '')
    : prizes.pool
    ? String(prizes.pool).replace(/^₹\s*/, '')
    : computedSum > 0
    ? computedSum.toLocaleString('en-IN')
    : '';

  const hasPrizes = Boolean(displayTotalPrize || prizes.first || prizes.second || prizes.third) || ev.badgeClass === 'badge-prize';
  const eligibility   = sanitizeText(ev.eligibility || '');
  const rules         = sanitizeText(ev.rules || '');
  const eligibilityList = eligibility ? eligibility.split('\n').map(s => s.trim()).filter(Boolean) : [];
  const rulesList = rules ? rules.split('\n').map(s => s.trim()).filter(Boolean) : [];
  const totalRulesCount = eligibilityList.length + rulesList.length;
  const RULES_PREVIEW_LIMIT = 3;
  const hasMoreRules = totalRulesCount > RULES_PREVIEW_LIMIT;

  const visibleEligibility = showFullRules
    ? eligibilityList
    : eligibilityList.slice(0, RULES_PREVIEW_LIMIT);

  const remainingRulesBudget = Math.max(0, RULES_PREVIEW_LIMIT - visibleEligibility.length);
  const visibleRules = showFullRules
    ? rulesList
    : rulesList.slice(0, remainingRulesBudget);
  const perks         = ev.perks       || '';
  const pocName       = ev.pocName     || '';
  const pocPhone      = ev.pocPhone    || ev.phone   || '';
  const pocEmail      = ev.pocEmail    || ev.email   || '';
  const website       = ev.website     || ev.registrationUrl || '';
  const mode          = ev.mode        || 'In-Person';
  const brochureUrl   = ev.brochureUrl || '';
  const individualCompetitions = Array.isArray(ev.competitions)
    ? ev.competitions.filter(item => item && competitionValue(item.name))
    : [];

  const isEventOwner = Boolean(ownerId && currentUserId && String(ownerId) === String(currentUserId));
  const canEditEvent = isEventOwner && isLiveEvent;
  const canManageCompetitions = canEditEvent;

  const registrationStatus = isExpired
    ? 'Event ended'
    : (countdown && !countdown.isExpired && countdown.d <= 3) || (ev.deadlineDays > 0 && ev.deadlineDays <= 3)
    ? 'Closing soon'
    : 'Registration open';

  const canonicalUrl = `${SITE_URL}/event/${ev.slug || ev.id}`;
  const seoDescription = (
    safeAbout
      ? safeAbout.replace(/\s+/g, ' ').trim().slice(0, 155)
      : `${ev.name} at ${ev.college}, ${ev.city}. ${ev.category} on FestNest — discover details and register.`
  );
  const eventJsonLd = buildEventJsonLd(ev, canonicalUrl, seoDescription);

  // Title two-tone word split
  const titleWords = (ev.name || '').trim().split(' ');
  const titleSplitIndex = Math.max(1, Math.ceil(titleWords.length / 2));
  const titlePart1 = titleWords.slice(0, titleSplitIndex).join(' ');
  const titlePart2 = titleWords.slice(titleSplitIndex).join(' ');

  // Dynamic nav items
  const navItems = [
    'Overview',
    safeAbout && 'About',
    individualCompetitions.length && 'Competitions',
    (hasPrizes || perks || ev.highlights?.length) && 'Prizes',
    (eligibility || rules) && 'Rules',
    (ev.orgName || ev.college) && 'Organizer',
    (pocPhone || pocEmail || website || pocName) && 'Contact',
  ].filter(Boolean);

  // Compact events for sidebar
  const sidebarEvents = (related.length > 0 ? related : featuredEvs).slice(0, 3);

  // Featured event for sidebar
  const sidebarFeaturedEvent = featuredEvs[0] || related[0] || null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="min-h-screen bg-white w-full overflow-x-hidden pb-16">

      <Seo
        rawTitle={`${ev.name} — ${ev.college} | FestNest`}
        description={seoDescription}
        canonical={canonicalUrl}
        image={ev.imageUrl || DEFAULT_OG_IMAGE}
        type="article"
        jsonLd={eventJsonLd}
      />

      {/* ══ SECTION A: EVENT HERO (Dark Navy Two-Column) ══ */}
      <div
        ref={heroRef}
        className="relative w-full bg-[#0B0819] text-white pt-6 pb-12 md:pb-16 overflow-hidden"
      >
        {/* Subtle purple radial background glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 right-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[12px] sm:text-[13px] text-white/50">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} className="text-white/30 flex-shrink-0" />
            <Link to="/explore" className="hover:text-white transition-colors capitalize">{ev.category || 'Events'}</Link>
            <ChevronRight size={14} className="text-white/30 flex-shrink-0" />
            <span className="text-white/80 font-medium truncate max-w-[200px] sm:max-w-[340px]">{ev.name}</span>
          </nav>

          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] items-center gap-8 lg:gap-12">
            {/* Left Column: Details */}
            <div className="flex flex-col items-start min-w-0">
              {/* Badges */}
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase border shadow-sm ${
                  registrationStatus === 'Closing soon'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : registrationStatus === 'Event ended'
                    ? 'bg-white/10 text-white/60 border-white/20'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    registrationStatus === 'Closing soon' ? 'bg-amber-400 animate-pulse' : registrationStatus === 'Event ended' ? 'bg-white/40' : 'bg-emerald-400'
                  }`} />
                  {registrationStatus}
                </span>

                <span className="rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 px-3 py-1 text-[11px] font-bold tracking-wider uppercase shadow-sm">
                  {ev.category || 'Event'}
                </span>
              </div>

              {/* Title with Two-Tone Styling */}
              <h1 className="font-heading font-black text-[32px] sm:text-[42px] lg:text-[48px] uppercase tracking-tight leading-[1.08] mb-3.5 break-words">
                <span>{titlePart1}</span>
                {titlePart2 && (
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400">
                    {' '}{titlePart2}
                  </span>
                )}
              </h1>

              {/* Organizer / Location Meta */}
              <div className="flex items-center gap-2 text-white/70 text-[13px] sm:text-[14px] font-medium mb-4">
                <Sparkles size={16} className="text-primary-mid flex-shrink-0" />
                <span className="truncate">
                  {ev.orgName || ev.college} • {ev.city}{ev.state ? `, ${ev.state}` : ''}
                </span>
              </div>

              {/* Summary Description */}
              {safeAbout && (
                <p className="text-white/75 text-[14px] sm:text-[15px] leading-relaxed max-w-xl mb-6 line-clamp-3">
                  {safeAbout}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={!isExpired && !registering && !registered ? { scale: 1.01 } : {}}
                  whileTap={!isExpired && !registering && !registered ? { scale: 0.97 } : {}}
                  onClick={handleRegister}
                  disabled={registering || registered || isExpired}
                  className={`px-6 py-3.5 rounded-lg font-sans text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all duration-fast disabled:opacity-75 ${
                    registered
                      ? 'bg-[#16A34A]'
                      : isExpired
                      ? 'bg-zinc-600 cursor-not-allowed shadow-none'
                      : `${cfg?.color || 'bg-primary hover:bg-primary-dark'} shadow-indigo`
                  }`}
                >
                  {registering ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  ) : registered ? (
                    <>
                      <CheckCircle2 size={17} /> Registered!
                    </>
                  ) : isExpired ? (
                    <>Registration Closed</>
                  ) : (
                    <>
                      {cfg?.label || 'Book Tickets'} <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { setUserToggled(true); toggleSave(ev.id); }}
                  className={`px-4 py-3.5 rounded-lg border text-[13px] font-semibold flex items-center gap-2 transition-all ${
                    isSaved
                      ? 'border-primary bg-primary text-white'
                      : 'border-white/20 bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save'}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: ev?.name, url: window.location.href }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(window.location.href).catch(() => {});
                      showToast('Link copied! 📋', 'success');
                    }
                  }}
                  className="px-4 py-3.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-[13px] flex items-center gap-2 transition-all"
                >
                  <Share2 size={16} />
                  Share
                </motion.button>

                {canEditEvent && (
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => navigate(`/event/${ev.slug || ev.id}/edit`)}
                    className="px-4 py-3.5 rounded-lg border border-purple-400/40 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 font-bold text-[13px] flex items-center gap-1.5 transition-all"
                  >
                    Edit Event
                  </motion.button>
                )}
              </div>
            </div>

            {/* Right Column: Poster Image with Floating Overlay */}
            <div className="relative w-full">
              <div
                onClick={() => ev.imageUrl && setLightboxOpen(true)}
                className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl aspect-[16/10] bg-surface-2 group cursor-pointer"
              >
                {ev.imageUrl ? (
                  <img
                    src={ev.imageUrl}
                    alt={ev.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/60 to-purple-900/60 text-[80px]">
                    {ev.emoji || '🎉'}
                  </div>
                )}

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Floating Prize Pool Overlay Badge */}
                {displayTotalPrize && (
                  <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md border border-white/15 rounded-xl p-3 sm:p-4 text-left shadow-2xl">
                    <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/60 mb-0.5">
                      Total Prize Pool
                    </div>
                    <div className="font-mono font-bold text-white text-[18px] sm:text-[22px] leading-tight">
                      ₹{displayTotalPrize}
                    </div>
                    <div className="text-[11px] text-white/60 mt-0.5">
                      Total winnings
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION B: EVENT INFORMATION STRIP (7-Column Bar) ══ */}
      <div className="w-full border-y border-border bg-white overflow-x-auto no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-[1280px] flex divide-x divide-border min-w-max">

          {/* DATE */}
          <div className="flex items-start gap-2.5 px-5 py-4 min-w-[130px]">
            <CalendarDays size={16} strokeWidth={1.8} className="flex-shrink-0 text-primary mt-0.5" />
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary mb-0.5">Date</div>
              <div className="text-[14px] font-bold text-text-1 leading-snug">{ev.startDate || 'TBA'}</div>
              {ev.endDate && <div className="text-[12px] text-text-3 mt-0.5">to {ev.endDate}</div>}
            </div>
          </div>

          {/* VENUE */}
          <div className="flex items-start gap-2.5 px-5 py-4 min-w-[140px]">
            <MapPin size={16} strokeWidth={1.8} className="flex-shrink-0 text-primary mt-0.5" />
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary mb-0.5">Venue</div>
              <div className="text-[14px] font-bold text-text-1 leading-snug truncate max-w-[150px]">{ev.city || ev.venue || 'Campus'}</div>
              <div className="text-[12px] text-text-3 mt-0.5 truncate max-w-[150px]">{ev.college || ev.venue || 'India'}</div>
            </div>
          </div>

          {/* MODE */}
          <div className="flex items-start gap-2.5 px-5 py-4 min-w-[110px]">
            {mode === 'Online'
              ? <Monitor size={16} strokeWidth={1.8} className="flex-shrink-0 text-primary mt-0.5" />
              : <Building2 size={16} strokeWidth={1.8} className="flex-shrink-0 text-primary mt-0.5" />}
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary mb-0.5">Mode</div>
              <div className="text-[14px] font-bold text-text-1 leading-snug">{mode}</div>
              <div className="text-[12px] text-text-3 mt-0.5">{mode === 'Online' ? 'Virtual' : 'Offline'}</div>
            </div>
          </div>

          {/* ENTRY FEE */}
          <div className="flex items-start gap-2.5 px-5 py-4 min-w-[130px]">
            <IndianRupee size={16} strokeWidth={1.8} className="flex-shrink-0 text-primary mt-0.5" />
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary mb-0.5">Entry Fee</div>
              <div className="text-[14px] font-bold text-text-1 leading-snug">{ev.price || 'Free'}</div>
              <div className="text-[12px] text-text-3 mt-0.5">{ev.priceNote || 'per team'}</div>
            </div>
          </div>

          {/* ELIGIBILITY */}
          <div className="flex items-start gap-2.5 px-5 py-4 min-w-[130px]">
            <Users size={16} strokeWidth={1.8} className="flex-shrink-0 text-primary mt-0.5" />
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary mb-0.5">Eligibility</div>
              <div className="text-[14px] font-bold text-text-1 leading-snug">{ev.teamSize || 'Open to all'}</div>
              <div className="text-[12px] text-text-3 mt-0.5">per team</div>
            </div>
          </div>

          {/* DEADLINE */}
          <div className="flex items-start gap-2.5 px-5 py-4 min-w-[130px]">
            <Clock size={16} strokeWidth={1.8} className="flex-shrink-0 text-primary mt-0.5" />
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary mb-0.5">Deadline</div>
              <div className="text-[14px] font-bold text-text-1 leading-snug">
                {isExpired
                  ? 'Closed'
                  : countdown && !countdown.isExpired
                  ? countdown.d > 0
                    ? `${countdown.d}d ${countdown.h}h left`
                    : `${countdown.h}h ${countdown.m}m left`
                  : ev.deadlineDays > 0
                  ? `${ev.deadlineDays} days left`
                  : 'Closing soon'}
              </div>
              <div className="text-[12px] text-text-3 mt-0.5">
                {isExpired ? 'Registration ended' : 'Registration closes'}
              </div>
            </div>
          </div>

          {/* PRIZE POOL */}
          <div className="flex items-start gap-2.5 px-5 py-4 min-w-[140px]">
            <Trophy size={16} strokeWidth={1.8} className="flex-shrink-0 text-primary mt-0.5" />
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-primary mb-0.5">Prize Pool</div>
              <div className="text-[14px] font-bold text-text-1 leading-snug">{displayTotalPrize ? `₹${displayTotalPrize}` : 'Exciting Prizes'}</div>
              <div className="text-[12px] text-text-3 mt-0.5">Total winnings</div>
            </div>
          </div>

        </div>
      </div>

      {/* ══ SECTION C: STICKY SECTION NAVIGATION ══ */}
      <SectionNav items={navItems} activeId={activeSection} />

      {/* ══ SECTION D: MAIN CONTENT + RIGHT SIDEBAR ══ */}
      <div id="overview" ref={setSectionRef('overview')} className="mx-auto max-w-[1280px] w-full px-4 sm:px-6 md:px-8 lg:grid lg:grid-cols-[1fr_360px] lg:gap-9 items-start">

        {/* ── LEFT COLUMN (≈2/3 width) ── */}
        <div className="flex flex-col gap-8 min-w-0 w-full">

          {/* Mobile Ticket & Countdown Card (Visible only on < lg screens) */}
          <div className="lg:hidden">
            <TicketCountdownCard
              ev={ev}
              cfg={cfg}
              countdown={countdown}
              registering={registering}
              registered={registered}
              isSaved={isSaved}
              onToggleSave={() => { setUserToggled(true); toggleSave(ev.id); }}
              handleRegister={handleRegister}
              showToast={showToast}
              isMobile
            />
          </div>

          {/* Tags */}
          {ev.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ev.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 text-[12px] font-semibold bg-surface-2 border border-border rounded-full text-text-2">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* ── ABOUT THIS EVENT ── */}
          {safeAbout && (
            <section id="about" ref={setSectionRef('about')} className="scroll-mt-28">
              <SectionHeading>About the Event</SectionHeading>
              <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                <MultilineText
                  text={showFullAbout ? safeAbout : aboutShort}
                  className="text-[14px] sm:text-[15px] text-text-2 leading-relaxed"
                />
                {!showFullAbout && safeAbout.length > 300 && (
                  <span className="text-[14px] text-text-3"> …</span>
                )}
                {safeAbout.length > 300 && (
                  <button
                    onClick={() => setShowFullAbout(v => !v)}
                    className="text-[13px] font-bold text-primary mt-3 hover:underline inline-flex items-center gap-1"
                  >
                    {showFullAbout ? 'Show less ↑' : 'Read more ↓'}
                  </button>
                )}
              </div>
            </section>
          )}

          {/* ── COMPETITION MANAGER (Event Owner Only) ── */}
          {canManageCompetitions && (
            <CompetitionManager
              eventKey={ev.slug || ev.id}
              eventName={ev.name}
              showToast={showToast}
              onCompetitionsChanged={() => {
                eventsApi.get(ev.slug || ev.id)
                  .then(response => setEv(normaliseEvent(response.data?.event)))
                  .catch(() => {});
              }}
            />
          )}

          {/* ── COMPETITIONS CAROUSEL ── */}
          {individualCompetitions.length > 0 && (
            <section id="competitions" ref={setSectionRef('competitions')} className="scroll-mt-28">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading font-bold text-[20px] sm:text-[22px] text-text-1 tracking-tight">Competitions</h2>
                  <p className="text-[13px] text-text-3 mt-0.5">
                    {individualCompetitions.length} event{individualCompetitions.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-text-3 hidden sm:inline mr-1">Scroll to explore</span>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(competitionsScrollRef, 'left')}
                    aria-label="Previous competitions"
                    className="w-8 h-8 rounded-full border border-border bg-white text-text-2 hover:border-primary hover:text-primary flex items-center justify-center transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(competitionsScrollRef, 'right')}
                    aria-label="Next competitions"
                    className="w-8 h-8 rounded-full border border-border bg-white text-text-2 hover:border-primary hover:text-primary flex items-center justify-center transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Horizontal Scroll Row */}
              <div
                ref={competitionsScrollRef}
                className="flex gap-4 overflow-x-auto pb-3 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-nowrap"
              >
                {individualCompetitions.map((competition, competitionIndex) => {
                  const registeredCount = competition.currentTeams ?? competition.registeredTeams ?? (competitionIndex % 2 === 0 ? 142 : 67);
                  const capacityCount = competition.capacity ?? competition.maxTeams ?? (competitionIndex % 2 === 0 ? 200 : 80);
                  const pct = Math.min(100, Math.round((registeredCount / capacityCount) * 100));
                  const isAlmostFull = pct >= 80;
                  const catLabel = competition.category || competition.type || competition.format || 'COMPETITION';

                  const badgeColors = [
                    'border-indigo-400 text-indigo-600 bg-indigo-50',
                    'border-rose-400 text-rose-600 bg-rose-50',
                    'border-amber-400 text-amber-700 bg-amber-50',
                    'border-blue-400 text-blue-600 bg-blue-50',
                    'border-emerald-400 text-emerald-700 bg-emerald-50',
                  ];
                  const badgeColor = badgeColors[competitionIndex % badgeColors.length];

                  return (
                    <div
                      key={competition._id || competition.name}
                      className="relative flex-shrink-0 w-[270px] sm:w-[290px] bg-white rounded-xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col justify-between"
                      style={{ borderTop: '2px solid #4F46E5' }}
                    >
                      {/* Card Top */}
                      <div>
                        <div className="relative px-4 pt-4 pb-1 flex items-start justify-between">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                            {catLabel}
                          </span>
                          <span
                            className="absolute top-1 right-3 font-heading font-black text-[48px] leading-none select-none pointer-events-none"
                            style={{ color: '#E8E7F9' }}
                            aria-hidden="true"
                          >
                            {String(competitionIndex + 1).padStart(2, '0')}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div className="px-4 pt-2 pb-2">
                          <h3 className="font-heading font-bold text-[16px] leading-snug text-text-1 mb-1.5 break-words pr-7">
                            {competition.name}
                          </h3>
                          {competition.description && (
                            <p className="text-[12px] leading-relaxed text-text-3 line-clamp-2 break-words mb-3">
                              {sanitizeText(competition.description)}
                            </p>
                          )}

                          {/* Metadata Icons */}
                          <div className="space-y-1.5 text-[12px] text-text-2">
                            <div className="flex items-center gap-2">
                              <Users size={13} className="text-primary flex-shrink-0" />
                              <span className="truncate">{competition.eligibility || competition.teamSize || '2–4 members'} • ₹{competition.registrationFee || '500/team'}</span>
                            </div>
                            {competition.venue && (
                              <div className="flex items-center gap-2">
                                <MapPin size={13} className="text-primary flex-shrink-0" />
                                <span className="truncate">{competition.venue}</span>
                              </div>
                            )}
                            {(competition.prizeDetails || competition.prize) && (
                              <div className="flex items-center gap-2">
                                <Trophy size={13} className="text-primary flex-shrink-0" />
                                <span className="truncate">{competition.prizeDetails || competition.prize}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom: Progress & CTA */}
                      <div className="pt-2">
                        {/* Capacity Progress Bar */}
                        <div className="px-4 pb-3">
                          <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-text-3">
                            <span>{registeredCount}/{capacityCount} teams</span>
                            <span className={isAlmostFull ? 'text-amber-600 font-bold' : 'text-text-3'}>
                              {isAlmostFull ? 'Almost full' : `${pct}%`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isAlmostFull ? 'bg-amber-500' : 'bg-primary'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* View Details Link */}
                        <div className="border-t border-border px-4 py-2.5 bg-surface/50">
                          <button
                            type="button"
                            onClick={() => setSelectedCompetition(competitionIndex)}
                            className="flex items-center gap-1 text-[13px] font-bold text-primary hover:text-primary-dark transition-colors"
                          >
                            View Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── PRIZES & PERKS ── */}
          {(hasPrizes || perks || ev.highlights?.length > 0) && (
            <section id="prizes" ref={setSectionRef('prizes')} className="scroll-mt-28">
              <SectionHeading>Prizes & Perks</SectionHeading>

              {/* Redesigned Dynamic Blue-Violet Prize Pool Banner Card */}
              {displayTotalPrize && (
                <div className="relative overflow-hidden rounded-xl border border-indigo-100/90 bg-gradient-to-r from-[#EEF2FF] via-[#F5F3FF] to-[#EDE9FE] p-4 sm:p-5 shadow-[0_2px_12px_rgba(79,70,229,0.06)] mb-4">
                  {/* Subtle background glow accents */}
                  <div
                    aria-hidden="true"
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-400/15 blur-2xl pointer-events-none"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-400/15 blur-2xl pointer-events-none"
                  />

                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left: Icon + Label + Big Bold Amount + Description */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm border border-primary/15">
                        <Trophy size={22} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] sm:text-[11px] font-bold font-mono tracking-[0.14em] uppercase text-primary">
                            TOTAL PRIZE POOL
                          </span>
                        </div>
                        <div className="font-mono font-black text-[28px] sm:text-[36px] leading-tight tracking-tight text-text-1 mt-0.5">
                          ₹{displayTotalPrize}
                        </div>
                        <p className="text-[12px] text-text-3 font-medium mt-0.5">
                          Total rewards & cash prizes for top performers
                        </p>
                      </div>
                    </div>

                    {/* Right: Expand Breakdown CTA (if individual podium prizes exist) */}
                    {(prizes.first || prizes.second || prizes.third) && (
                      <button
                        type="button"
                        onClick={() => setShowPrizeBreakdown(v => !v)}
                        className="self-start sm:self-center px-4 py-2 rounded-lg border border-indigo-200/90 bg-white/90 hover:bg-white text-[12px] sm:text-[13px] font-bold text-primary shadow-sm hover:shadow transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {showPrizeBreakdown ? 'Hide Breakdown ↑' : 'View Prize Details →'}
                      </button>
                    )}
                  </div>

                  {/* Expandable Podium Breakdown */}
                  {showPrizeBreakdown && (
                    <div className="relative z-10 mt-4 pt-4 border-t border-indigo-100">
                      <PrizePodium prizes={prizes} />
                    </div>
                  )}
                </div>
              )}

              {/* Additional Perks 4-Card Grid */}
              <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-3">Additional Perks</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { icon: Briefcase, label: 'Internship Opportunities' },
                    { icon: Gift,      label: 'Goodies & Swag' },
                    { icon: Award,     label: 'Certificates' },
                    { icon: Globe,     label: 'Exposure & Networking' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-2">
                      <Icon size={18} className="text-primary flex-shrink-0" />
                      <span className="text-[13px] font-medium text-text-1 leading-snug">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── ELIGIBILITY & RULES ── */}
          {(eligibility || rules) && (
            <section id="rules" ref={setSectionRef('rules')} className="scroll-mt-28">
              <SectionHeading>Eligibility & Rules</SectionHeading>
              <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] space-y-5">
                {visibleEligibility.length > 0 && (
                  <div>
                    <h3 className="text-[13px] font-bold text-text-1 uppercase tracking-wider mb-2">Who can participate</h3>
                    <ul className="space-y-1.5 text-[14px] text-text-2 list-disc list-inside">
                      {visibleEligibility.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item.replace(/^[-*•]\s*/, '')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {visibleRules.length > 0 && (
                  <div className={visibleEligibility.length > 0 ? "pt-4 border-t border-border" : ""}>
                    <h3 className="text-[13px] font-bold text-text-1 uppercase tracking-wider mb-2">General Rules</h3>
                    <ul className="space-y-1.5 text-[14px] text-text-2 list-disc list-inside">
                      {visibleRules.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item.replace(/^[-*•]\s*/, '')}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {hasMoreRules && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFullRules(v => !v)}
                      className="text-[13px] font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                    >
                      {showFullRules ? 'Show less ↑' : 'Read more ↓'}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── ORGANIZED BY ── */}
          {(ev.orgName || ev.college) && (
            <section id="organizer" ref={setSectionRef('organizer')} className="scroll-mt-28">
              <SectionHeading>Organized By</SectionHeading>
              <div className="rounded-xl border border-border bg-white p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center text-[20px] font-heading font-black flex-shrink-0">
                    {ev.orgLogo ? ev.orgLogo : (ev.orgName || ev.college || 'E').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-bold text-[16px] text-text-1 truncate">
                      {ev.orgName || ev.college}
                    </div>
                    <div className="text-[12px] text-text-3 mt-0.5 truncate">
                      Event Organizer • {ev.orgLocation || ev.city || 'India'}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    setFollowed(f => !f);
                    showToast(followed ? 'Unfollowed' : `Following ${ev.orgName || ev.college} ✓`, 'success');
                  }}
                  className={`px-5 py-2.5 rounded-lg text-[13px] font-bold border transition-all ${
                    followed
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'border-border bg-white text-text-1 hover:border-primary hover:text-primary'
                  }`}
                >
                  {followed ? '✓ Following' : 'Follow'}
                </motion.button>
              </div>
            </section>
          )}

          {/* ── BROCHURE (If available) ── */}
          {brochureUrl && (
            <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <FileText size={22} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[14px] text-text-1 leading-snug truncate">Event Brochure</div>
                  <div className="text-[12px] text-text-3 mt-0.5 truncate">Official event PDF document</div>
                </div>
              </div>
              <button
                onClick={handleDownloadBrochure}
                className="px-4 py-2 rounded-lg bg-white border border-amber-300 text-amber-800 text-[13px] font-semibold hover:bg-amber-100 transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Download size={14} /> Download
              </button>
            </section>
          )}

          {/* ── CONTACT & INQUIRIES (2×2 Grid) ── */}
          {(pocName || pocPhone || pocEmail || website) && (
            <section id="contact" ref={setSectionRef('contact')} className="scroll-mt-28">
              <SectionHeading>Contact & Inquiries</SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pocName && (
                  <div className="p-4 rounded-xl border border-border bg-white flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                      <UserRound size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-4">Point of Contact</div>
                      <div className="text-[14px] font-bold text-text-1 truncate">{pocName}</div>
                    </div>
                  </div>
                )}

                {pocPhone && (
                  <a
                    href={`tel:${pocPhone}`}
                    className="p-4 rounded-xl border border-border bg-white flex items-center gap-3.5 hover:border-emerald-400 hover:shadow-sm transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <Phone size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-4">Phone Number</div>
                      <div className="text-[14px] font-bold text-text-1 group-hover:text-emerald-600 transition-colors truncate">{pocPhone}</div>
                    </div>
                  </a>
                )}

                {pocEmail && (
                  <a
                    href={`mailto:${pocEmail}`}
                    className="p-4 rounded-xl border border-border bg-white flex items-center gap-3.5 hover:border-primary hover:shadow-sm transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-4">Email Address</div>
                      <div className="text-[14px] font-bold text-text-1 group-hover:text-primary transition-colors truncate">{pocEmail}</div>
                    </div>
                  </a>
                )}

                {website && website !== '#' && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-xl border border-border bg-white flex items-center gap-3.5 hover:border-indigo-400 hover:shadow-sm transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Globe size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-4">Website</div>
                      <div className="text-[14px] font-bold text-text-1 group-hover:text-indigo-600 transition-colors truncate">{website.replace(/^https?:\/\//, '')}</div>
                    </div>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* ── MORE RELATED EVENTS CAROUSEL ── */}
          {related.length > 0 && (
            <section className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-[20px] sm:text-[22px] text-text-1 tracking-tight">
                  More {ev.category ? `${ev.category} Events` : 'Related Events'}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollCarousel(relatedScrollRef, 'left')}
                    aria-label="Previous events"
                    className="w-8 h-8 rounded-full border border-border bg-white text-text-2 hover:border-primary hover:text-primary flex items-center justify-center transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCarousel(relatedScrollRef, 'right')}
                    aria-label="Next events"
                    className="w-8 h-8 rounded-full border border-border bg-white text-text-2 hover:border-primary hover:text-primary flex items-center justify-center transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div
                ref={relatedScrollRef}
                className="flex gap-4 overflow-x-auto pb-3 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-nowrap"
              >
                {related.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/event/${rel.id}`)}
                    className="flex-shrink-0 w-[240px] sm:w-[260px] bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="h-[125px] w-full bg-surface-2 relative overflow-hidden">
                      {rel.imageUrl ? (
                        <img src={rel.imageUrl} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[40px]">{rel.emoji || '🎉'}</div>
                      )}
                    </div>
                    <div className="p-3.5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="font-heading font-bold text-[14px] text-text-1 line-clamp-1 group-hover:text-primary transition-colors">
                          {rel.name}
                        </div>
                        <div className="text-[12px] text-text-3 mt-1 truncate">
                          {rel.college || rel.city}
                        </div>
                      </div>
                      <div className="mt-3 text-[12px] font-bold text-primary flex items-center gap-1">
                        View Event <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* ── RIGHT COLUMN: STICKY SIDEBAR (≈1/3 width on desktop) ── */}
        <div className="hidden lg:flex lg:flex-col lg:gap-6 sticky top-[84px]">

          {/* 1. TICKET CARD WITH LIVE COUNTDOWN */}
          <TicketCountdownCard
            ev={ev}
            cfg={cfg}
            countdown={countdown}
            registering={registering}
            registered={registered}
            isSaved={isSaved}
            onToggleSave={() => { setUserToggled(true); toggleSave(ev.id); }}
            handleRegister={handleRegister}
            showToast={showToast}
          />

          {/* 2. FEATURED EVENT CARD */}
          {sidebarFeaturedEvent && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-2.5 px-0.5">
                Featured Event
              </div>
              <div
                onClick={() => navigate(`/event/${sidebarFeaturedEvent.id || sidebarFeaturedEvent.slug}`)}
                className="rounded-xl overflow-hidden border border-white/10 bg-[#0B0819] text-white p-4 cursor-pointer group shadow-md hover:shadow-xl transition-all"
              >
                <div className="relative h-[130px] rounded-lg overflow-hidden mb-3 bg-white/5">
                  {sidebarFeaturedEvent.imageUrl ? (
                    <img src={sidebarFeaturedEvent.imageUrl} alt={sidebarFeaturedEvent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[36px]">{sidebarFeaturedEvent.emoji || '🔥'}</div>
                  )}
                  <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Featured
                  </span>
                </div>

                <h4 className="font-heading font-bold text-[15px] text-white line-clamp-1 group-hover:text-primary-mid transition-colors">
                <h4 className="font-sans font-bold text-[15px] text-white line-clamp-1 group-hover:text-primary-mid transition-colors">
                  {sidebarFeaturedEvent.name}
                </h4>
                <div className="text-[12px] text-white/60 mt-0.5 truncate">
                  {sidebarFeaturedEvent.college || sidebarFeaturedEvent.city}
                </div>
                <div className="text-[11px] text-white/40 mt-1">
                <div className="text-[11px] font-mono text-white/40 mt-1">
                  {sidebarFeaturedEvent.startDate || 'Upcoming'}
                </div>

                <button
                  type="button"
                  className="mt-3 w-full py-2 rounded-lg bg-primary text-white text-[12px] font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-1.5"
                >
                  View Event <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* 3. MORE EVENTS COMPACT LIST */}
          {sidebarEvents.length > 0 && (
            <div className="rounded-xl border border-border bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-3">
                More Events
              </div>
              <div className="space-y-3">
                {sidebarEvents.map(sEv => (
                  <div
                    key={sEv.id}
                    onClick={() => navigate(`/event/${sEv.id}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-surface-3 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {sEv.imageUrl ? (
                        <img src={sEv.imageUrl} alt={sEv.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[20px]">{sEv.emoji || '🎉'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-heading font-bold text-[13px] text-text-1 truncate group-hover:text-primary transition-colors">
                      <div className="font-sans font-bold text-[13px] text-text-1 truncate group-hover:text-primary transition-colors">
                        {sEv.name}
                      </div>
                      <div className="text-[11px] text-text-3 truncate mt-0.5">
                        {sEv.college || sEv.city}
                      </div>
                      <div className="text-[10px] text-text-4 mt-0.5">
                      <div className="text-[10px] font-mono text-text-4 mt-0.5">
                        {sEv.startDate || 'Upcoming'}
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-text-4 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                ))}
              </div>

              <div className="pt-3 mt-2 border-t border-border">
                <Link
                  to="/explore"
                  className="text-[12px] font-bold text-primary hover:underline flex items-center justify-center gap-1"
                >
                  Explore more events <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ══ MOBILE STICKY BOTTOM CTA BAR ══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[50] bg-white/95 backdrop-blur-[20px] border-t border-border px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 max-w-[500px] mx-auto">
          <div className="flex-shrink-0">
            <div className="font-mono font-bold text-[20px] leading-none text-text-1">
              {ev.price || 'Free'}
            </div>
            <div className="text-[11px] text-text-3 mt-0.5">{ev.priceNote || 'per team'}</div>
          </div>
          {isExpired ? (
            <div className="flex-shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-300">
              Closed
            </div>
          ) : countdown && !countdown.isExpired ? (
            <div className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold ${
              countdown.d <= 3 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-primary-light text-primary border border-primary/20'
            }`}>
              {countdown.d > 0 ? `${countdown.d}d ${countdown.h}h left` : `${countdown.h}h ${countdown.m}m left`}
            </div>
          ) : null}
          <motion.button
            whileTap={!isExpired && !registering && !registered ? { scale: 0.97 } : {}}
            onClick={handleRegister}
            disabled={registering || registered || isExpired}
            className={`flex-1 py-3.5 rounded-lg font-sans text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-75 ${
              registered
                ? 'bg-[#16A34A]'
                : isExpired
                ? 'bg-zinc-600 cursor-not-allowed shadow-none'
                : `${cfg?.color || 'bg-primary'} shadow-indigo`
            }`}
          >
            {registering ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : registered ? (
              <>
                <CheckCircle2 size={16} /> Registered!
              </>
            ) : isExpired ? (
              <>Registration Closed</>
            ) : (
              <>
                {cfg?.label || 'Book Tickets'} <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* ══ COMPETITION DETAILS MODAL ══ */}
      <AnimatePresence>
        {selectedCompetition !== null && individualCompetitions[selectedCompetition] && (
          <CompetitionDetails
            competition={individualCompetitions[selectedCompetition]}
            index={selectedCompetition}
            onClose={() => setSelectedCompetition(null)}
          />
        )}
      </AnimatePresence>

      {/* ══ IMAGE LIGHTBOX ══ */}
      <AnimatePresence>
        {lightboxOpen && ev.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
            role="dialog" aria-modal="true" aria-label={`${ev.name} image`}>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 text-white hover:bg-white/25 transition-all"
              aria-label="Close image">
              <X size={18} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={ev.imageUrl} alt={ev.name}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl cursor-default" />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
