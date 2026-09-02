import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Users, AlertTriangle, HelpCircle, CalendarDays, Clock, MapPin,
  Monitor, Globe, Building2, Trophy, IndianRupee, Gift, ScrollText, Phone,
  Star, FileText, Download, Bookmark, Share2, CheckCircle2, ChevronDown,
  X, ExternalLink, Mail, UserRound, ArrowRight, Sparkles, Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { events as eventsApi } from '../services/api';
import { normaliseEvent, normaliseEvents } from '../services/normalise';
import FeaturedEventCard from '../components/FeaturedEventCard';
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
    <div className={`space-y-3.5 md:space-y-4 ${className}`.trim()}>
      {blocks.map((block, index) => (
        <p key={index} className="m-0 whitespace-pre-wrap break-words leading-relaxed">
          {block}
        </p>
      ))}
    </div>
  );
}

const BG_GRADIENT = {
  bg1: 'from-indigo-600 via-indigo-700 to-slate-900',
  bg2: 'from-amber-500 via-orange-600 to-stone-900',
  bg3: 'from-teal-600 via-cyan-700 to-slate-900',
  bg4: 'from-emerald-600 via-teal-700 to-slate-900',
  bg5: 'from-fuchsia-600 via-purple-700 to-slate-900',
  bg6: 'from-rose-600 via-pink-700 to-stone-900',
  bg7: 'from-amber-600 via-yellow-700 to-stone-900',
  bg8: 'from-blue-600 via-indigo-700 to-slate-900',
};

const ENTRY_CONFIG = {
  free:  { label: 'Register Free', color: 'bg-[#16A34A] hover:bg-[#15803D]', shadow: 'hover:shadow-[0_4px_16px_rgba(22,163,74,0.35)]',  pill: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' },
  paid:  { label: 'Book Tickets',  color: 'bg-[#B45309] hover:bg-[#92400E]', shadow: 'hover:shadow-[0_4px_16px_rgba(180,83,9,0.35)]',   pill: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' },
  prize: { label: 'Register Now',  color: 'bg-primary hover:bg-primary-dark', shadow: 'hover:shadow-indigo', pill: 'bg-primary-light text-primary border-[#C7D2FE]' },
};

const DetailSkeleton = () => {
  const S = ({ h = '', w = '', className = '', style }) => (
    <div className={['skeleton', h, w, className].filter(Boolean).join(' ')} style={style} />
  );

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-16">
      {/* Hero skeleton */}
      <div className="w-full bg-slate-100 aspect-[16/9] sm:aspect-[21/9] md:h-[400px]">
        <S className="w-full h-full" style={{ borderRadius: 0 }} />
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_360px] gap-8 md:gap-12 items-start">
          <div className="space-y-8">
            <div className="space-y-3">
              <S h="h-4" w="w-24" className="rounded-full" />
              <S h="h-9" w="w-4/5" className="rounded-lg" />
              <S h="h-4" w="w-1/2" className="rounded-md" />
            </div>
            <S h="h-14" w="w-full" className="rounded-xl" />
            <div className="space-y-4 pt-4">
              <S h="h-6" w="w-32" className="rounded-md" />
              <S h="h-28" w="w-full" className="rounded-lg" />
            </div>
            <div className="space-y-4 pt-4">
              <S h="h-6" w="w-40" className="rounded-md" />
              <div className="flex gap-3 overflow-hidden">
                <S h="h-36" w="w-64" className="rounded-xl flex-shrink-0" />
                <S h="h-36" w="w-64" className="rounded-xl flex-shrink-0" />
              </div>
            </div>
          </div>
          <div className="hidden md:block sticky top-24">
            <S h="h-[420px]" w="w-full" className="rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ kicker, title, action }) => (
  <div className="flex items-end justify-between gap-4 mb-4 pb-2 border-b border-border/50">
    <div>
      {kicker && (
        <div className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-primary mb-1">
          {kicker}
        </div>
      )}
      <h2 className="font-heading font-bold text-[20px] sm:text-[22px] md:text-[24px] text-text-1 tracking-tight">
        {title}
      </h2>
    </div>
    {action}
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
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-sm p-0 md:items-center md:p-5"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      role="presentation">
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={e => e.stopPropagation()}
        className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:max-w-[560px] md:rounded-2xl"
        role="dialog" aria-modal="true" aria-labelledby="competition-dialog-title">
        <div className="flex-shrink-0 border-b border-border px-5 pb-4 pt-3 md:pt-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#CBCBC6] md:hidden" />
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light text-[13px] font-bold text-primary font-mono">{index + 1}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Competition details</div>
              <h3 id="competition-dialog-title" className="mt-0.5 font-heading text-[18px] sm:text-[20px] font-bold leading-tight text-text-1">{competition.name}</h3>
            </div>
            <button type="button" onClick={onClose} aria-label="Close competition details"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-3 hover:text-text-1 hover:bg-surface-3 transition-colors">
              <X size={17} />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {competition.description && (
            <MultilineText text={sanitizeText(competition.description)} className="text-[14px] text-text-2 leading-relaxed" />
          )}
          {rows.length > 0 && (
            <div className="divide-y divide-border/70 rounded-xl bg-surface-2/60 border border-border/70 overflow-hidden">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 px-4 py-3 text-[13px]">
                  <span className="font-semibold text-text-3">{label}</span>
                  <span className="max-w-[65%] text-right font-medium text-text-1 leading-snug">{sanitizeText(value)}</span>
                </div>
              ))}
            </div>
          )}
          {competition.rules && (
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-4 font-mono">Additional Rules / Guidelines</div>
              <MultilineText text={sanitizeText(competition.rules)} className="text-[13.5px] text-text-2 bg-surface-2/40 p-3.5 rounded-xl border border-border/60" />
            </div>
          )}
          {isValidExternalUrl(competition.registrationLink) && (
            <button type="button" onClick={() => openExternalRegistrationLink(competition.registrationLink)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-bold text-white shadow-indigo hover:bg-primary-dark transition-all">
              Register for this competition <ExternalLink size={15} />
            </button>
          )}
        </div>
        <div className="flex-shrink-0 border-t border-border bg-white px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] md:pb-3">
          <button type="button" onClick={onClose} className="w-full rounded-xl border border-border py-2.5 text-[13px] font-semibold text-text-2 hover:bg-surface-2 transition-colors">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const PrizePodium = ({ prizes }) => {
  const { first, second, third, total, pool } = prizes;
  if (!first && !second && !third && !total && !pool) return null;
  const podium = [
    { rankLabel: '1st', label: '1st Place', value: first,  badgeBg: 'bg-amber-100 text-amber-900 border-amber-300', bg: 'bg-gradient-to-b from-amber-50/80 to-white border-amber-200/80', text: 'text-amber-900', ring: 'ring-amber-400/20' },
    { rankLabel: '2nd', label: '2nd Place', value: second, badgeBg: 'bg-slate-100 text-slate-800 border-slate-300', bg: 'bg-gradient-to-b from-slate-50/80 to-white border-slate-200/80', text: 'text-slate-800', ring: 'ring-slate-400/20' },
    { rankLabel: '3rd', label: '3rd Place', value: third,  badgeBg: 'bg-orange-100 text-orange-900 border-orange-300', bg: 'bg-gradient-to-b from-orange-50/80 to-white border-orange-200/80', text: 'text-orange-900', ring: 'ring-orange-400/20' },
  ].filter(p => p.value);

  return (
    <div className="space-y-3">
      {podium.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {podium.map(({ rankLabel, label, value, badgeBg, bg, text, ring }) => (
            <div key={label} className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${bg} ring-1 ${ring}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold font-mono border ${badgeBg}`}>
                  {rankLabel}
                </span>
                <Trophy size={16} className="text-text-4" />
              </div>
              <div className={`font-mono font-bold text-[20px] sm:text-[22px] tracking-tight ${text}`}>
                ₹{Number(value.replace(/,/g,'')).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] font-medium text-text-3 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}
      {(total || pool) && (
        <div className="flex items-center justify-between px-4 py-3.5 bg-primary-xlight/60 border border-primary/20 rounded-xl text-primary">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles size={15} />
            </span>
            <span className="text-[13px] font-bold tracking-wide uppercase font-mono">Total Prize Pool</span>
          </div>
          <span className="font-mono font-bold text-[18px] sm:text-[20px] text-primary">₹{total || pool}</span>
        </div>
      )}
    </div>
  );
};

const RelatedCard = ({ ev, onClick }) => (
  <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="group flex-shrink-0 w-[180px] sm:w-[200px] text-left cursor-pointer transition-all">
    <div className={`w-full h-[100px] sm:h-[110px] rounded-xl overflow-hidden mb-2.5 relative border border-border/60 bg-gradient-to-br ${BG_GRADIENT[ev.bg] || 'from-indigo-600 to-slate-900'} flex items-center justify-center`}>
      {ev.imageUrl ? (
        <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <span className="text-[36px] sm:text-[42px] select-none">{ev.emoji}</span>
      )}
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase font-mono">
        {ev.category}
      </span>
    </div>
    <div className="font-heading font-bold text-[13px] text-text-1 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
      {ev.name}
    </div>
    <div className="text-[11px] text-text-3 mt-1 truncate flex items-center gap-1">
      <MapPin size={11} className="flex-shrink-0 text-text-4" />
      {ev.city}
    </div>
  </motion.button>
);

function SectionNav({ items, activeId }) {
  return (
    <nav aria-label="Event sections" className="sticky top-0 z-30 mb-8 border-y border-border/80 bg-white/95 backdrop-blur-md md:top-[64px] w-full max-w-full">
      <div className="mx-auto flex max-w-[1280px] items-center gap-1 sm:gap-2 overflow-x-auto px-4 py-2.5 flex-nowrap no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-8">
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
                  const offset = window.innerWidth >= 768 ? 130 : 80;
                  const y = el.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-fast select-none ${
                isActive
                  ? 'bg-text-1 text-white shadow-sm'
                  : 'text-text-3 hover:text-text-1 hover:bg-surface-2 active:bg-surface-3'
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

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/70 last:border-b-0 transition-colors">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-heading text-[15px] font-bold text-text-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span>{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={17} className="flex-shrink-0 text-text-3" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-[14px] leading-relaxed text-text-2">
              <MultilineText text={answer} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function useCountdown(deadlineDays) {
  const [target] = useState(() => {
    if (!deadlineDays || deadlineDays <= 0) return null;
    return Date.now() + deadlineDays * 86400000;
  });
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return target ? remaining : null;
}

function ActionPanel({ ev, cfg, registering, registered, isSaved, onToggleSave, handleRegister, showToast }) {
  const countdown = useCountdown(ev.deadlineDays);
  
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white border border-border/80 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      
      {/* Countdown header — dark bg with countdown timer */}
      {countdown && ev.deadlineDays > 0 && (
        <div className="bg-[#111110] text-white px-5 pt-4 pb-4 relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.35),transparent_65%)] pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-white/60 mb-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Registration Closes In
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: countdown.d, l: 'Days' },
                { v: countdown.h, l: 'Hours' },
                { v: countdown.m, l: 'Mins' },
                { v: countdown.s, l: 'Secs' },
              ].map(({ v, l }) => (
                <div key={l} className="text-center rounded-lg bg-white/5 py-1.5 border border-white/10">
                  <div className="font-mono font-bold text-[22px] leading-none tabular-nums text-white">
                    {String(v).padStart(2, '0')}
                  </div>
                  <div className="text-[8.5px] font-mono tracking-[0.12em] uppercase text-white/50 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Price section */}
      <div className="p-5 border-b border-border/80">
        <div className="flex items-baseline justify-between mb-1">
          <div className="text-[11px] font-bold font-mono tracking-wider uppercase text-text-4">Entry Fee</div>
          {ev.deadlineDays > 0 && ev.deadlineDays <= 6 && (
            <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${ev.deadlineDays <= 3 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
              {ev.deadlineDays}d remaining
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <div className={`font-mono font-bold text-[32px] leading-none ${ev.entryType==='free' ? 'text-[#16A34A]' : ev.entryType==='paid' ? 'text-[#B45309]' : 'text-primary'}`}>
            {ev.price}
          </div>
          {ev.priceNote && <span className="text-[13px] text-text-3 font-medium">({ev.priceNote})</span>}
        </div>
      </div>

      {/* Key Quick Specs */}
      <div className="p-5 space-y-3 bg-surface-2/30 border-b border-border/80">
        {[
          { Icon: CalendarDays, label: 'Date', value: ev.endDate ? `${ev.startDate} – ${ev.endDate}` : ev.startDate },
          { Icon: MapPin, label: 'Venue', value: ev.venue || ev.city },
          { Icon: Users, label: 'Team Size', value: ev.teamSize },
        ].map(({ Icon: LIcon, label, value }) => value ? (
          <div key={label} className="flex items-start gap-3 text-[13px]">
            <LIcon size={15} className="flex-shrink-0 text-text-4 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-text-4 text-[11px] font-medium block uppercase tracking-wider">{label}</span>
              <span className="text-text-1 font-semibold leading-tight break-words">{value}</span>
            </div>
          </div>
        ) : null)}
      </div>

      {/* CTAs */}
      <div className="p-5 space-y-2.5">
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={handleRegister} disabled={registering || registered}
          className={`w-full py-3.5 rounded-xl font-heading text-[15px] font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-sm ${
            registered ? 'bg-[#16A34A]' : `${cfg.color} ${cfg.shadow}`
          }`}>
          <AnimatePresence mode="wait">
            {registering ? (
              <motion.span key="s" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </motion.span>
            ) : registered ? (
              <motion.span key="d" initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}} className="flex items-center gap-2">
                <Check size={18} strokeWidth={2.5} />
                You're Registered!
              </motion.span>
            ) : (
              <motion.span key="c" initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2">
                {cfg.label}
                <ArrowRight size={17} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="flex gap-2">
          <motion.button whileTap={{scale:0.95}} onClick={onToggleSave}
            className={`flex-1 py-2.5 rounded-xl border text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isSaved ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-2 hover:bg-surface-2'
            }`}>
            <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Saved' : 'Save'}
          </motion.button>
          <motion.button whileTap={{scale:0.95}} onClick={() => {
              if (navigator.share) {
                navigator.share({ title: ev?.name, url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                showToast('Link copied! 📋', 'success');
              }
            }}
            className="flex-1 py-2.5 rounded-xl border border-border text-[13px] font-semibold text-text-2 flex items-center justify-center gap-1.5 hover:bg-surface-2 transition-all">
            <Share2 size={15} />
            Share
          </motion.button>
        </div>
      </div>
    </motion.div>
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
  const [rulesOpen,     setRulesOpen]     = useState(false);
  const [serverSaved,   setServerSaved]   = useState(null);
  const [userToggled,   setUserToggled]   = useState(false);
  const [featuredEvs,     setFeaturedEvs]     = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [lightboxOpen,    setLightboxOpen]    = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [activeSection,  setActiveSection] = useState('overview');

  const heroRef = useRef(null);
  const { scrollY }   = useScroll();
  const emojiY        = useTransform(scrollY, [0, 300], [0, 60]);
  const heroOpacity   = useTransform(scrollY, [0, 200], [1, 0.6]);

  // Section refs for IntersectionObserver
  const sectionRefs = useRef({});
  const setSectionRef = useCallback((id) => (el) => {
    if (el) sectionRefs.current[id] = el;
  }, []);

  // IntersectionObserver for active section highlighting
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

  const handleRegister = async () => {
    if (registered) return;
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

  const handleBack = () => {
    if (navType === 'PUSH') navigate(-1);
    else navigate('/explore');
  };

  if (loading) return <DetailSkeleton />;

  if (error || !ev) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <Seo title={error ? 'Could not load event' : 'Event not found'} noindex />
      {error ? <AlertTriangle size={72} strokeWidth={1.3} className="text-amber-500 mb-4" /> : <HelpCircle size={72} strokeWidth={1.3} className="text-text-3 mb-4" />}
      <h2 className="font-heading font-bold text-[22px] text-text-1 tracking-tight mb-2">
        {error ? 'Could not load event' : 'Event not found'}
      </h2>
      <p className="text-[14px] text-text-3 mb-6">{error || 'This event may have ended or been removed.'}</p>
      <div className="flex gap-3">
        {error && <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-white rounded-xl text-[14px] font-semibold hover:bg-primary-dark transition-colors">Retry</button>}
        <button onClick={() => navigate('/')} className="px-6 py-3 border border-border text-text-2 rounded-xl text-[14px] font-semibold hover:bg-surface-2 transition-colors">← Back to Home</button>
      </div>
    </div>
  );

  // Derived values
  const safeAbout  = sanitizeText(ev.about || '');
  const aboutShort = safeAbout.slice(0, 280);
  const prizes = {
    first:  ev.prize1  || ev.prizeFirst  || '',
    second: ev.prize2  || ev.prizeSecond || '',
    third:  ev.prize3  || ev.prizeThird  || '',
    total:  ev.totalPrize || '',
    pool:   ev.prizeDetails || '',
  };
  const hasPrizes     = Object.values(prizes).some(Boolean) || ev.badgeClass === 'badge-prize';
  const eligibility   = sanitizeText(ev.eligibility || '');
  const rules         = sanitizeText(ev.rules || '');
  const perks         = ev.perks       || '';
  const pocName       = ev.pocName     || '';
  const pocPhone      = ev.pocPhone    || ev.phone   || '';
  const pocEmail      = ev.pocEmail    || ev.email   || '';
  const website       = ev.website     || ev.registrationUrl || '';
  const mode          = ev.mode        || '';
  const brochureUrl   = ev.brochureUrl || '';
  const individualCompetitions = Array.isArray(ev.competitions)
    ? ev.competitions.filter(item => item && competitionValue(item.name))
    : [];
  const ownerId = typeof ev.hostedBy === 'object' ? ev.hostedBy?._id : ev.hostedBy;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isLiveEvent = ev.isActive !== false && ev.isApproved !== false;
  const isEventOwner = Boolean(ownerId && currentUserId && String(ownerId) === String(currentUserId));
  const canEditEvent = isEventOwner && isLiveEvent;
  const canManageCompetitions = canEditEvent;
  const registrationStatus = !isLiveEvent ? 'Event ended' : ev.deadlineDays > 0 && ev.deadlineDays <= 3 ? 'Registration closing soon' : 'Registration open';
  const faqItems = [
    eligibility && ['Who can participate?', eligibility],
    ev.price && ['Is there an entry fee?', `${ev.price}${ev.priceNote ? ` (${ev.priceNote})` : ''}`],
    ev.deadlineDays > 0 && ['When does registration close?', `Registration closes in ${ev.deadlineDays} day${ev.deadlineDays === 1 ? '' : 's'}.`],
    mode && ['What is the event mode?', mode],
    ev.venue && ['Where is the venue?', ev.venue],
    ev.teamSize && ['What is the team size?', ev.teamSize],
  ].filter(Boolean);

  const canonicalUrl = `${SITE_URL}/event/${ev.slug || ev.id}`;
  const seoDescription = (
    safeAbout
      ? safeAbout.replace(/\s+/g, ' ').trim().slice(0, 155)
      : `${ev.name} at ${ev.college}, ${ev.city}. ${ev.category} on FestNest — discover details and register.`
  );
  const eventJsonLd = buildEventJsonLd(ev, canonicalUrl, seoDescription);

  // Dynamic nav items
  const navItems = ['Overview', safeAbout && 'About', individualCompetitions.length && 'Competitions', (perks || hasPrizes || ev.highlights?.length) && 'Benefits', (eligibility || rules) && 'Rules', ev.orgName && 'Organizer', faqItems.length && 'FAQ', (pocPhone || pocEmail || website) && 'Contact'].filter(Boolean);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="min-h-screen bg-white w-full overflow-x-hidden pb-28 md:pb-16">

      <Seo
        rawTitle={`${ev.name} — ${ev.college} | FestNest`}
        description={seoDescription}
        canonical={canonicalUrl}
        image={ev.imageUrl || DEFAULT_OG_IMAGE}
        type="article"
        jsonLd={eventJsonLd}
      />

      {/* ══ HERO BANNER ══ */}
      <div ref={heroRef} className="relative w-full bg-slate-950 overflow-hidden">
        {/* Background Image / Ambient Glow */}
        <div className={`relative w-full aspect-[16/9] sm:aspect-[21/9] md:h-[440px] bg-gradient-to-br ${BG_GRADIENT[ev.bg] || 'from-indigo-900 to-slate-950'}`}>
          {ev.imageUrl ? (
            <img
              src={ev.imageUrl}
              alt={ev.name}
              onClick={() => setLightboxOpen(true)}
              className="w-full h-full object-cover opacity-90 cursor-zoom-in"
            />
          ) : (
            <motion.div
              style={{ y: emojiY, opacity: heroOpacity }}
              className="absolute inset-0 flex items-center justify-center text-[110px] sm:text-[150px] md:text-[220px] select-none pointer-events-none"
              aria-hidden
            >
              {ev.emoji}
            </motion.div>
          )}

          {/* Vignette Overlay for cinematic contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30 pointer-events-none" />

          {/* Floating Top Bar (Back, Edit, Share, Save) */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 md:px-8 md:pt-6 z-20">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-[13px] font-medium text-white border border-white/20 transition-all shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
              <span>Back</span>
            </motion.button>

            <div className="flex items-center gap-2">
              {canEditEvent && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => navigate(`/event/${ev.slug || ev.id}/edit`)}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-black/50 hover:bg-black/75 px-3 text-[12px] font-bold text-white shadow-sm backdrop-blur-md transition-all"
                  aria-label="Edit event"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  <span className="hidden sm:inline">Edit Event</span>
                  <span className="sm:hidden">Edit</span>
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: ev?.name, url: window.location.href }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(window.location.href).catch(() => {});
                    showToast('Link copied! 📋', 'success');
                  }
                }}
                className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-sm transition-all"
                aria-label="Share"
              >
                <Share2 size={16} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => { setUserToggled(true); toggleSave(ev.id); }}
                className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center border shadow-sm transition-all ${
                  isSaved
                    ? 'bg-primary text-white border-primary shadow-indigo'
                    : 'bg-black/50 hover:bg-black/75 text-white border-white/20'
                }`}
                aria-label={isSaved ? 'Remove from saved' : 'Save event'}
              >
                <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
              </motion.button>
            </div>
          </div>

          {/* Bottom Hero Meta Overlay for Desktop / Tablet */}
          <div className="hidden md:block absolute bottom-0 left-0 right-0 px-8 pb-8 z-10 max-w-[1280px] mx-auto">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/25 px-3 py-0.5 text-[11px] font-mono font-bold tracking-wider uppercase text-white">
                {ev.category}
              </span>
              <span className={`rounded-full px-3 py-0.5 text-[11px] font-bold font-mono tracking-wide ${
                registrationStatus === 'Registration closing soon'
                  ? 'bg-amber-400/90 text-amber-950'
                  : registrationStatus === 'Event ended'
                  ? 'bg-white/20 text-white/70'
                  : 'bg-emerald-400/90 text-emerald-950'
              }`}>
                {registrationStatus}
              </span>
            </div>
            <h1 className="font-heading font-bold text-white text-[32px] lg:text-[44px] leading-tight tracking-tight max-w-4xl break-words drop-shadow-md">
              {ev.name}
            </h1>
            <p className="text-white/80 text-[15px] font-medium mt-1 flex items-center gap-1.5">
              <Building2 size={15} className="text-white/60 flex-shrink-0" />
              <span>{ev.college}</span>
              <span className="text-white/40">·</span>
              <span>{ev.city}</span>
            </p>
          </div>
        </div>

        {/* Mobile Header Block (Directly below banner image with dark-to-light theme bridge) */}
        <div className="md:hidden px-4 pt-4 pb-2">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-md bg-primary-light text-primary border border-primary/20 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase">
              {ev.category}
            </span>
            <span className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold font-mono ${
              registrationStatus === 'Registration closing soon'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : registrationStatus === 'Event ended'
                ? 'bg-surface-2 text-text-3 border border-border'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {registrationStatus}
            </span>
          </div>
          <h1 className="font-heading font-bold text-text-1 text-[24px] sm:text-[28px] leading-tight tracking-tight break-words">
            {ev.name}
          </h1>
          <p className="text-text-3 text-[13px] font-medium mt-1.5 flex items-center gap-1">
            <Building2 size={14} className="text-text-4 flex-shrink-0" />
            <span className="truncate">{ev.college} · {ev.city}</span>
          </p>
        </div>
      </div>

      {/* ══ SECTION NAVIGATION ══ */}
      <SectionNav items={navItems} activeId={activeSection} />

      {/* ══ MAIN PAGE FLOW ══ */}
      <div id="overview" ref={setSectionRef('overview')} className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8 md:grid md:grid-cols-[minmax(0,1fr)_360px] lg:grid-cols-[minmax(0,1fr)_380px] md:gap-10 lg:gap-14 md:items-start">

        {/* ── LEFT COLUMN (Spacious, breathing sections) ── */}
        <div className="flex flex-col gap-10 sm:gap-12 min-w-0 w-full">

          {/* 0. KEY LOGISTICS STRIP (Unboxed, clean visual info system) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-surface-2/60 border border-border/70">
            {ev.startDate && (
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-border/60 text-primary flex-shrink-0">
                  <CalendarDays size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-text-4 block">Date</span>
                  <span className="text-[13px] font-semibold text-text-1 leading-snug break-words block">{ev.endDate ? `${ev.startDate} – ${ev.endDate}` : ev.startDate}</span>
                </div>
              </div>
            )}
            {ev.venue && (
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-border/60 text-primary flex-shrink-0">
                  <MapPin size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-text-4 block">Venue</span>
                  <span className="text-[13px] font-semibold text-text-1 leading-snug break-words block">{ev.venue}</span>
                </div>
              </div>
            )}
            {mode && (
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-border/60 text-primary flex-shrink-0">
                  {mode === 'Online' ? <Monitor size={16} /> : <Building2 size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-text-4 block">Mode</span>
                  <span className="text-[13px] font-semibold text-text-1 leading-snug break-words block">{mode}</span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-border/60 text-primary flex-shrink-0">
                <IndianRupee size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-text-4 block">Entry</span>
                <span className="text-[13px] font-semibold text-text-1 leading-snug break-words block">{ev.price || 'Free'}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {ev.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 -mt-4">
              {ev.tags.map(tag => (
                <span key={tag} className="px-3 py-1 text-[12px] font-medium bg-surface-2 text-text-2 rounded-full hover:bg-surface-3 transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 1. ABOUT THIS EVENT */}
          {safeAbout && (
            <section id="about" ref={setSectionRef('about')} className="scroll-mt-28">
              <SectionHeader kicker="01 · OVERVIEW" title="About this Event" />
              <div className="prose prose-slate max-w-none text-[15px] sm:text-[16px] text-text-2 leading-relaxed font-body">
                <MultilineText text={showFullAbout ? safeAbout : aboutShort} />
              </div>
              {!showFullAbout && safeAbout.length > 280 && (
                <span className="text-text-3">… </span>
              )}
              {safeAbout.length > 280 && (
                <button
                  type="button"
                  onClick={() => setShowFullAbout(v => !v)}
                  className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  {showFullAbout ? 'Show less ↑' : 'Read full description ↓'}
                </button>
              )}
            </section>
          )}

          {/* ── COMPETITION MANAGER (Owner controls) ── */}
          {canManageCompetitions && (
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary-xlight/40">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary mb-2">Organizer Controls</div>
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
            </div>
          )}

          {/* 2. COMPETITIONS & ACTIVITIES (Horizontal Preview Rail) */}
          {individualCompetitions.length > 0 && (
            <section id="competitions" ref={setSectionRef('competitions')} className="scroll-mt-28 w-full max-w-full overflow-hidden">
              <SectionHeader
                kicker="02 · ACTIVITIES"
                title="Competitions & Tracks"
                action={
                  <span className="text-[12px] font-mono font-bold text-text-4">
                    {individualCompetitions.length} total
                  </span>
                }
              />
              <p className="text-[13px] text-text-3 -mt-2 mb-4">Swipe or scroll horizontally to explore all competitions.</p>

              <div className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-4 pt-1 flex-nowrap no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full max-w-full">
                {individualCompetitions.map((competition, competitionIndex) => (
                  <button
                    type="button"
                    key={competition._id || competition.name}
                    onClick={() => setSelectedCompetition(competitionIndex)}
                    className="group relative w-[275px] sm:w-[310px] md:w-[330px] flex-shrink-0 rounded-2xl border border-border/80 bg-white p-4 sm:p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light font-mono text-[12px] font-bold text-primary">
                        {competitionIndex + 1}
                      </span>
                      {competition.eligibility && (
                        <span className="truncate max-w-[170px] rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-text-3">
                          {competition.eligibility}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-[16px] sm:text-[17px] font-bold leading-snug text-text-1 group-hover:text-primary transition-colors break-words">
                      {competition.name}
                    </h3>
                    {competition.description && (
                      <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-text-3 break-words">
                        {sanitizeText(competition.description)}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[12px]">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-text-4 block">Fee</span>
                        <span className="font-semibold text-text-1">{competition.registrationFee || 'Free'}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-bold text-primary text-[12px] group-hover:translate-x-0.5 transition-transform">
                        Details <ArrowRight size={13} />
                      </span>
                    </div>
                  </button>
                ))}
                <div className="w-4 flex-shrink-0" aria-hidden="true" />
              </div>
            </section>
          )}

          {/* 3. BENEFITS & PRIZES */}
          {(perks || hasPrizes || ev.highlights?.length > 0) && (
            <section id="benefits" ref={setSectionRef('benefits')} className="scroll-mt-28 space-y-6">
              <SectionHeader kicker="03 · REWARDS" title="Perks & Prize Pool" />

              {/* Prize Showcase */}
              {hasPrizes && <PrizePodium prizes={prizes} />}

              {/* What You Get / Highlights */}
              {ev.highlights?.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-4">Key Highlights</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ev.highlights.map((h, i) => (
                      <div key={h} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2/60 border border-border/60">
                        <span className="text-[20px] flex-shrink-0">{h.slice(0, 2)}</span>
                        <span className="text-[13.5px] font-medium text-text-1 leading-snug break-words">{h.slice(2).trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Perks Chips */}
              {perks && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-4">Additional Perks</div>
                  <div className="flex flex-wrap gap-2">
                    {perks.split(',').map(p => p.trim()).filter(Boolean).map(perk => (
                      <span key={perk} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 text-[13px] font-medium text-text-2 border border-border/50">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 4. ELIGIBILITY & RULES */}
          {(eligibility || rules) && (
            <section id="rules" ref={setSectionRef('rules')} className="scroll-mt-28">
              <SectionHeader kicker="04 · GUIDELINES" title="Eligibility & Rules" />
              <div className="divide-y divide-border/70 border-y border-border/70">
                {eligibility && (
                  <div className="py-4">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary mb-1">Who Can Participate</div>
                    <MultilineText text={eligibility} className="text-[14px] text-text-2" />
                  </div>
                )}
                {rules && (
                  <div className="py-4">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary mb-1">General Rules</div>
                    <MultilineText text={rules} className="text-[14px] text-text-2" />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 5. ORGANIZER & CONTACT */}
          <div className="space-y-8">
            {ev.orgName && (
              <section id="organizer" ref={setSectionRef('organizer')} className="scroll-mt-28">
                <SectionHeader kicker="05 · HOST" title="Organized By" />
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-surface-2/50 border border-border/70">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[24px] flex-shrink-0 border border-border/80 shadow-sm">
                      {ev.orgLogo}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-heading font-bold text-[16px] text-text-1 break-words">{ev.orgName}</div>
                      <div className="text-[12px] text-text-3 truncate">{ev.orgLocation}</div>
                      {ev.orgSub && <div className="text-[11px] text-text-4 truncate">{ev.orgSub}</div>}
                    </div>
                  </div>
                  <motion.button whileTap={{ scale: 0.94 }}
                    onClick={() => { setFollowed(f => !f); showToast(followed ? 'Unfollowed' : `Following ${ev.orgName} ✓`, 'success'); }}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                      followed ? 'bg-text-1 text-white' : 'bg-white border border-border text-text-1 hover:bg-surface-2'
                    }`}>
                    {followed ? '✓ Following' : '+ Follow'}
                  </motion.button>
                </div>
              </section>
            )}

            {/* Brochure Document */}
            {brochureUrl && (
              <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-800 flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-bold text-[14px] text-text-1 truncate">Event Brochure</div>
                    <div className="text-[11px] font-mono text-text-3">PDF Document · Official</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBrochure}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold text-amber-900 bg-white border border-amber-300 hover:bg-amber-100 transition-colors flex-shrink-0 shadow-sm"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            )}

            {/* Quick Contact Actions */}
            {(pocName || pocPhone || pocEmail || website) && (
              <section id="contact" ref={setSectionRef('contact')} className="scroll-mt-28">
                <SectionHeader kicker="06 · HELP" title="Contact & Inquiries" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {pocName && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-2/60 border border-border/60">
                      <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-text-3 flex-shrink-0 border border-border/60">
                        <UserRound size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono uppercase text-text-4 block">Point of Contact</span>
                        <span className="text-[13.5px] font-semibold text-text-1 truncate block">{pocName}</span>
                      </div>
                    </div>
                  )}
                  {pocPhone && (
                    <a href={`tel:${pocPhone}`} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-2/60 border border-border/60 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group">
                      <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-emerald-600 flex-shrink-0 border border-border/60 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Phone size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono uppercase text-text-4 block">Phone Support</span>
                        <span className="text-[13.5px] font-semibold text-text-1 group-hover:text-emerald-800 truncate block">{pocPhone}</span>
                      </div>
                    </a>
                  )}
                  {pocEmail && (
                    <a href={`mailto:${pocEmail}`} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-2/60 border border-border/60 hover:border-primary hover:bg-primary-xlight/40 transition-all group">
                      <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary flex-shrink-0 border border-border/60 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Mail size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono uppercase text-text-4 block">Email Helpdesk</span>
                        <span className="text-[13.5px] font-semibold text-text-1 group-hover:text-primary truncate block break-all">{pocEmail}</span>
                      </div>
                    </a>
                  )}
                  {website && website !== '#' && (
                    <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-2/60 border border-border/60 hover:border-primary hover:bg-primary-xlight/40 transition-all group">
                      <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary flex-shrink-0 border border-border/60 group-hover:bg-primary group-hover:text-white transition-colors">
                        <Globe size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono uppercase text-text-4 block">Official Website</span>
                        <span className="text-[13.5px] font-semibold text-text-1 group-hover:text-primary truncate block">{website.replace(/^https?:\/\//, '')}</span>
                      </div>
                      <ExternalLink size={14} className="text-text-4 flex-shrink-0" />
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* 6. FAQS */}
          {faqItems.length > 0 && (
            <section id="faq" ref={setSectionRef('faq')} className="scroll-mt-28">
              <SectionHeader kicker="07 · FAQS" title="Frequently Asked Questions" />
              <div className="border-t border-border/70">
                {faqItems.map(([question, answer]) => (
                  <FaqItem key={question} question={question} answer={answer} />
                ))}
              </div>
            </section>
          )}

          {/* Mobile Featured Events */}
          {featuredEvs.length > 0 && (
            <div className="md:hidden space-y-4 pt-4 border-t border-border/70">
              <SectionHeader kicker="DISCOVER" title="Featured on FestNest" />
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {featuredEvs.slice(0, 4).map(f => (
                  <RelatedCard key={f.id} ev={f} onClick={() => navigate(`/event/${f.id}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Related Category Events */}
          {related.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border/70">
              <SectionHeader kicker="EXPLORE" title={`More ${ev.category} Events`} />
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {related.map(r => <RelatedCard key={r.id} ev={r} onClick={() => navigate(`/event/${r.id}`)} />)}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (Desktop Sticky Sidebar) ── */}
        <div className="hidden md:flex md:flex-col md:gap-6 sticky top-[130px]">
          <ActionPanel
            ev={ev}
            cfg={cfg}
            registering={registering}
            registered={registered}
            isSaved={isSaved}
            onToggleSave={() => { setUserToggled(true); toggleSave(ev.id); }}
            handleRegister={handleRegister}
            showToast={showToast}
          />

          {/* Featured on FestNest Desktop Sidebar */}
          {(featuredLoading || featuredEvs.length > 0) && (
            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-text-4 px-1">
                More Events
              </div>
              {featuredLoading ? (
                <div className="space-y-3">
                  {[0, 1].map(i => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-border bg-white p-3 space-y-2">
                      <div className="skeleton w-full h-24 rounded-lg" />
                      <div className="skeleton h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                featuredEvs.slice(0, 2).map(f => (
                  <FeaturedEventCard key={f.id} event={f} className="w-full" />
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══ MOBILE STICKY BOTTOM BAR ══ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[50] bg-white/95 backdrop-blur-lg border-t border-border/80 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className={`font-mono font-bold text-[22px] leading-none ${ev.entryType==='free' ? 'text-[#16A34A]' : ev.entryType==='paid' ? 'text-[#B45309]' : 'text-primary'}`}>
              {ev.price}
            </div>
            <div className="text-[10.5px] font-medium text-text-3 mt-0.5">{ev.priceNote || 'Per entry'}</div>
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
            onClick={handleRegister} disabled={registering || registered}
            className={`flex-1 py-3.5 rounded-xl font-heading text-[15px] font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-sm ${
              registered ? 'bg-[#16A34A]' : `${cfg.color} ${cfg.shadow}`
            }`}>
            <AnimatePresence mode="wait">
              {registering ? (
                <motion.span key="s" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </motion.span>
              ) : registered ? (
                <motion.span key="d" initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}} className="flex items-center gap-1.5">
                  <Check size={17} strokeWidth={2.5} />
                  Registered!
                </motion.span>
              ) : (
                <motion.span key="c" initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-1.5">
                  {cfg.label}
                  <ArrowRight size={16} />
                </motion.span>
              )}
            </AnimatePresence>
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-zoom-out"
            role="dialog" aria-modal="true" aria-label={`${ev.name} image`}>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all"
              aria-label="Close image">
              <X size={20} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={ev.imageUrl} alt={ev.name}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl cursor-default" />
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
