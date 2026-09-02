import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Users, AlertTriangle, HelpCircle, CalendarDays, Clock, MapPin,
  Monitor, Globe, Building2, Trophy, IndianRupee, Gift, ScrollText, Phone,
  Star, FileText, Download, Bookmark, Share2, CheckCircle2, ChevronDown,
  X, ExternalLink, Mail, UserRound,
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
    <div className={`space-y-3 md:space-y-4 ${className}`.trim()}>
      {blocks.map((block, index) => (
        <p key={index} className="m-0 whitespace-pre-wrap break-words leading-6 md:leading-7">
          {block}
        </p>
      ))}
    </div>
  );
}

const BG_GRADIENT = {
  bg1: 'from-indigo-100 via-violet-50  to-blue-50',
  bg2: 'from-orange-100 via-amber-50   to-yellow-50',
  bg3: 'from-teal-100  via-cyan-50     to-emerald-50',
  bg4: 'from-green-100 via-emerald-50  to-teal-50',
  bg5: 'from-fuchsia-100 via-purple-50 to-pink-50',
  bg6: 'from-rose-100  via-pink-50     to-red-50',
  bg7: 'from-yellow-100 via-amber-50   to-orange-50',
  bg8: 'from-blue-100  via-sky-50      to-indigo-50',
};

const ENTRY_CONFIG = {
  free:  { label: 'Register Free', color: 'bg-[#16A34A] hover:bg-[#15803D]', shadow: 'hover:shadow-[0_4px_14px_rgba(22,163,74,0.35)]',  pill: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]' },
  paid:  { label: 'Book Tickets',  color: 'bg-[#B45309] hover:bg-[#92400E]', shadow: 'hover:shadow-[0_4px_14px_rgba(180,83,9,0.35)]',   pill: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' },
  prize: { label: 'Register Now',  color: 'bg-primary hover:bg-primary-dark', shadow: 'hover:shadow-indigo', pill: 'bg-primary-light text-primary border-[#C7D2FE]' },
};

const SECTION_IDS = ['overview', 'about', 'competitions', 'benefits', 'organizer', 'faq', 'contact'];

const DetailSkeleton = () => {
  const S = ({ h = '', w = '', className = '', style }) => (
    <div className={['skeleton', h, w, className].filter(Boolean).join(' ')} style={style} />
  );

  return (
    <div className="min-h-screen bg-white pb-[80px] md:pb-12">
      <S style={{ paddingTop: '56.25%', borderRadius: 0 }} className="w-full md:hidden" />
      <S className="hidden md:block w-full h-[420px]" style={{ borderRadius: 0 }} />
      <div className="px-4 md:px-10 mt-4 mb-6 md:max-w-[1280px] md:mx-auto">
        <div className="flex gap-3 flex-wrap">
          {[120, 100, 90, 80].map((px, i) => (
            <S key={i} h="h-8" className="rounded-lg flex-shrink-0" style={{ width: px }} />
          ))}
        </div>
      </div>
      <div className="sticky top-0 z-30 mb-7 border-y border-border bg-white/95 py-2 hidden md:block">
         <S h="h-8" className="w-[80%] mx-auto" />
      </div>
      <div className="px-4 md:px-8 md:max-w-[1280px] md:mx-auto md:grid md:grid-cols-[minmax(0,1fr)_360px] md:gap-9 md:items-start">
        <div className="flex flex-col gap-7">
          <S h="h-40" w="w-full" className="rounded-xl" />
          <S h="h-48" w="w-full" className="rounded-xl" />
          <S h="h-32" w="w-full" className="rounded-xl" />
          <S h="h-24" w="w-full" className="rounded-xl" />
          <S h="h-40" w="w-full" className="rounded-xl" />
        </div>
        <div className="hidden md:flex md:flex-col md:gap-5 sticky top-[130px]">
          <S h="h-[400px]" w="w-full" className="rounded-xl" />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3 md:hidden z-50">
        <S h="h-12" w="w-full" className="rounded-lg" />
      </div>
    </div>
  );
};

const InfoCell = ({ icon, label, value, accent, className = '', valueClassName = '' }) => (
  <div className={`rounded-md p-3 sm:p-4 flex min-w-0 flex-col gap-1.5 border overflow-hidden ${accent ? 'bg-primary-light border-[#C7D2FE]' : 'bg-surface border-border'} ${className}`}>
    <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-text-4">
      <span className="flex-shrink-0">{icon}</span>{label}
    </div>
    <div className={`text-[13px] font-semibold leading-snug ${accent ? 'text-primary' : 'text-text-1'} ${valueClassName}`}>{value}</div>
  </div>
);

const SectionHeading = ({ children, number }) => (
  <div className="flex items-center gap-3 mb-4">
    {number && (
      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-light border border-[#C7D2FE] flex items-center justify-center text-[12px] font-bold font-mono text-primary tracking-wide">
        {String(number).padStart(2, '0')}
      </span>
    )}
    <h2 className="font-heading font-bold text-[19px] text-text-1 tracking-snug">{children}</h2>
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
    <motion.div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-5"
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
  const { first, second, third, total, pool } = prizes;
  if (!first && !second && !third && !total && !pool) return null;
  const podium = [
    { rankLabel: '1st', label: '1st Prize', value: first,  bg: 'bg-[#FFFBEB] border-[#FDE68A]', text: 'text-[#B45309]' },
    { rankLabel: '2nd', label: '2nd Prize', value: second, bg: 'bg-[#F8FAFC] border-[#CBD5E1]', text: 'text-[#475569]' },
    { rankLabel: '3rd', label: '3rd Prize', value: third,  bg: 'bg-[#FFF7ED] border-[#FED7AA]', text: 'text-[#9A3412]' },
  ].filter(p => p.value);

  return (
    <div className="mb-5">
      <SectionHeading><span className="flex items-center gap-2"><Trophy size={17} strokeWidth={1.8} className="text-amber-500" /> Prize Pool</span></SectionHeading>
      {podium.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
          {podium.map(({ rankLabel, label, value, bg, text }) => (
            <div key={label} className={`border rounded-lg p-3 sm:p-4 text-center ${bg}`}>
              <div className={`text-[13px] sm:text-[14px] font-bold mb-0.5 ${text}`}>{rankLabel}</div>
              <div className={`font-mono font-bold text-[16px] sm:text-[18px] ${text}`}>₹{Number(value.replace(/,/g,'')).toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-text-3 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}
      {(total || pool) && (
        <div className="flex items-center justify-between px-4 py-3 bg-primary-light border border-[#C7D2FE] rounded-lg">
          <div className="flex items-center gap-2">
            <IndianRupee size={18} strokeWidth={1.8} className="text-primary" />
            <span className="text-[13px] font-semibold text-primary">Total Prize Pool</span>
          </div>
          <span className="font-mono font-bold text-[16px] sm:text-[18px] text-primary">₹{total || pool}</span>
        </div>
      )}
    </div>
  );
};

const RelatedCard = ({ ev, onClick }) => (
  <motion.button whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.10)' }} whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex-shrink-0 w-[160px] sm:w-[180px] bg-surface border border-border rounded-md overflow-hidden text-left cursor-pointer transition-all duration-base">
    <div className={`w-full h-[85px] sm:h-[90px] flex items-center justify-center text-[36px] sm:text-[40px] ${ev.bg}`}>
      {ev.imageUrl ? <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover" /> : ev.emoji}
    </div>
    <div className="p-2.5 sm:p-3">
      <div className="text-[10px] font-bold tracking-wider uppercase text-primary mb-0.5">{ev.category}</div>
      <div className="font-heading font-bold text-[12px] sm:text-[13px] text-text-1 leading-snug tracking-snug"
        style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{ev.name}</div>
      <div className="text-[11px] text-text-3 mt-1 truncate">{ev.city}</div>
    </div>
  </motion.button>
);

function SectionNav({ items, activeId }) {
  return (
    <nav aria-label="Event sections" className="sticky top-0 z-30 mb-6 border-y border-border bg-white/95 backdrop-blur-md md:top-[64px] w-full max-w-full overflow-hidden">
      <div className="mx-auto flex max-w-[1280px] items-center gap-1.5 overflow-x-auto px-4 py-2 flex-nowrap no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-8">
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
                  const offset = window.innerWidth >= 768 ? 130 : 70;
                  const y = el.getBoundingClientRect().top + window.scrollY - offset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}
              className={`flex-shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-all duration-fast flex items-center justify-center min-h-[38px] select-none ${
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

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left text-[14px] font-semibold text-text-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {question}
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
            <div className="px-4 pb-4 text-[13px] leading-relaxed text-text-3">
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
      className="bg-surface border border-border rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
      
      {/* Countdown header — dark bg with countdown timer */}
      {countdown && ev.deadlineDays > 0 && (
        <div className="bg-[#1E1B4B] text-white px-5 pt-5 pb-5 relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.4),transparent_65%)] pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-white/60 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A5F3FC] animate-pulse" />
              Registration closes in
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { v: countdown.d, l: 'Days' },
                { v: countdown.h, l: 'Hrs' },
                { v: countdown.m, l: 'Min' },
                { v: countdown.s, l: 'Sec' },
              ].map(({ v, l }) => (
                <div key={l} className="text-center">
                  <div className="font-mono font-bold text-[28px] leading-none tabular-nums text-white">
                    {String(v).padStart(2, '0')}
                  </div>
                  <div className="text-[9px] font-mono tracking-[0.14em] uppercase text-white/50 mt-1.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Price section */}
      <div className={`px-5 pt-5 pb-4 border-b border-border
        ${ev.entryType==='free'  ? 'bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]'
        : ev.entryType==='paid'  ? 'bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]'
                                  : 'bg-gradient-to-br from-primary-xlight to-primary-light'}`}>
        <div className="text-[11px] font-bold tracking-wider uppercase text-text-4 mb-1">Entry Fee</div>
        <div className={`font-mono font-bold text-[32px] leading-none mb-1
          ${ev.entryType==='free' ? 'text-[#16A34A]' : ev.entryType==='paid' ? 'text-[#B45309]' : 'text-primary'}`}>
          {ev.price}
        </div>
        <div className="text-[13px] text-text-3">{ev.priceNote}</div>
      </div>

      {/* Event quick details */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-[#16A34A]">
          <CheckCircle2 size={15} /> {registered ? 'Registration confirmed' : 'Registration open'}
        </div>
        {/* The urgency badge from original */}
        {ev.deadlineDays > 0 && ev.deadlineDays <= 12 && (
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-[13px] font-semibold
            ${ev.deadlineDays<=3 ? 'bg-red-bg text-red border border-red-border'
            : ev.deadlineDays<=6 ? 'bg-amber-bg text-amber border border-amber-border'
                                  : 'bg-green-bg text-[#16A34A] border border-green-border'}`}>
            {ev.deadlineDays<=3 ? <AlertTriangle size={15} strokeWidth={2} className="flex-shrink-0" /> : ev.deadlineDays<=6 ? <Clock size={15} strokeWidth={2} className="flex-shrink-0" /> : <span className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0" />}
            Closes in {ev.deadlineDays} day{ev.deadlineDays>1?'s':''}
          </div>
        )}
        {[
          {Icon:CalendarDays, label:ev.startDate},
          {Icon:MapPin,       label:ev.venue},
          {Icon:Users,        label:ev.teamSize},
        ].map(({Icon:LIcon,label}) => label ? (
            <div key={label} className="flex items-start gap-2.5 text-[13px] text-text-2">
              <LIcon size={14} strokeWidth={1.8} className="flex-shrink-0 mt-0.5 text-text-3" />
              <span className="leading-snug">{label}</span>
            </div>
          ) : null)}
      </div>

      {/* CTAs — IDENTICAL logic to original PriceCard */}
      <div className="px-5 pb-5 flex flex-col gap-2.5">
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
          onClick={handleRegister} disabled={registering || registered}
          className={`w-full py-[14px] rounded-md font-sans text-[15px] font-bold text-white flex items-center justify-center gap-2 transition-all duration-fast disabled:opacity-70
            ${registered ? 'bg-[#16A34A]' : `${cfg.color} ${cfg.shadow}`}`}>
          <AnimatePresence mode="wait">
            {registering ? (
              <motion.span key="s" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </motion.span>
            ) : registered ? (
              <motion.span key="d" initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}} className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><polyline points="20 6 9 17 4 12"/></svg>
                You're Registered!
              </motion.span>
            ) : (
              <motion.span key="c" initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2">
                {cfg.label}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m9 18 6-6-6-6"/></svg>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <div className="flex gap-2">
          <motion.button whileTap={{scale:0.94}} onClick={onToggleSave}
            className={`flex-1 py-3 rounded-md border-[1.5px] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-fast
              ${isSaved ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-2 hover:border-primary hover:text-primary hover:bg-primary-xlight'}`}>
            <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
            {isSaved ? 'Saved' : 'Save'}
          </motion.button>
          <motion.button whileTap={{scale:0.94}} onClick={() => {
              if (navigator.share) {
                navigator.share({ title: ev?.name, url: window.location.href }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                showToast('Link copied! 📋', 'success');
              }
            }}
            className="flex-1 py-3 rounded-md border-[1.5px] border-border text-[13px] font-semibold text-text-2 flex items-center justify-center gap-1.5 hover:border-primary hover:text-primary hover:bg-primary-xlight transition-all">
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

  // --- Section refs for IntersectionObserver ---
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
  }); // intentionally no deps — re-runs when refs change after data loads

  /* Fetch featured events (non-blocking, excludes the current event) */
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

  // --- Derived values (ALL IDENTICAL TO ORIGINAL) ---
  const safeAbout  = sanitizeText(ev.about || '');
  const aboutShort = safeAbout.slice(0, 240);
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
    ev.price && ['Is there an entry fee?', `${ev.price}${ev.priceNote ? ` ${ev.priceNote}` : ''}`],
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

  // Build nav items dynamically (only show sections that have content)
  const navItems = ['Overview', safeAbout && 'About', individualCompetitions.length && 'Competitions', (perks || hasPrizes || ev.highlights?.length) && 'Benefits', ev.orgName && 'Organizer', faqItems.length && 'FAQ', (pocPhone || pocEmail || website) && 'Contact'].filter(Boolean);

return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: 0.22 }}
    className="min-h-screen bg-white w-full overflow-x-hidden pb-[120px] md:pb-12">

    <Seo
      rawTitle={`${ev.name} — ${ev.college} | FestNest`}
      description={seoDescription}
      canonical={canonicalUrl}
      image={ev.imageUrl || DEFAULT_OG_IMAGE}
      type="article"
      jsonLd={eventJsonLd}
    />

    {/* ══ HERO ══ */}
    <div ref={heroRef} className="relative w-full bg-white md:bg-transparent md:overflow-hidden md:min-h-[420px]">
      {/* Poster Image / Emoji Banner */}
      <div className={`relative w-full aspect-[16/9] sm:aspect-[2/1] md:aspect-auto md:absolute md:inset-0 md:h-full bg-gradient-to-br ${BG_GRADIENT[ev.bg] || BG_GRADIENT.bg1} overflow-hidden`}>
        {ev.imageUrl ? (
          <img
            src={ev.imageUrl}
            alt={ev.name}
            onClick={() => setLightboxOpen(true)}
            className="w-full h-full object-cover cursor-zoom-in"
          />
        ) : (
          <motion.div
            style={{ y: emojiY, opacity: heroOpacity }}
            className="absolute inset-0 flex items-center justify-center text-[100px] sm:text-[140px] md:text-[220px] select-none pointer-events-none"
            aria-hidden
          >
            {ev.emoji}
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20 md:from-black/80 md:via-black/30 md:to-black/10 pointer-events-none" />

        {/* Top bar — Back / Edit / Share / Save */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-3 sm:px-4 sm:pt-4 md:px-10 md:pt-6 z-20">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-full md:rounded-md bg-white/90 md:bg-white/80 backdrop-blur-md text-[12px] md:text-[13px] font-medium text-text-1 border border-white/60 shadow-sm hover:bg-white transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 md:w-4 md:h-4"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </motion.button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {canEditEvent && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate(`/event/${ev.slug || ev.id}/edit`)}
                className="flex h-8 sm:h-9 md:h-10 items-center gap-1 sm:gap-1.5 rounded-full border border-white/60 bg-white/90 md:bg-white/80 px-2.5 sm:px-3 text-[11px] sm:text-[12px] font-bold text-primary shadow-sm backdrop-blur-md transition-all hover:bg-white"
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
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-white/90 md:bg-white/80 backdrop-blur-md flex items-center justify-center border border-white/60 shadow-sm hover:bg-white transition-all text-text-2"
              aria-label="Share"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-[17px] md:h-[17px]"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => { setUserToggled(true); toggleSave(ev.id); }}
              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full backdrop-blur-md flex items-center justify-center border shadow-sm transition-all
                ${isSaved ? 'bg-primary text-white border-primary shadow-indigo' : 'bg-white/90 md:bg-white/80 text-text-2 border-white/60 hover:bg-white'}`}
              aria-label={isSaved ? 'Remove from saved' : 'Save event'}
            >
              <svg viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-[17px] md:h-[17px]"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hero Bottom / Content Block */}
      <div className="relative px-4 pt-4 pb-4 md:absolute md:bottom-0 md:left-0 md:right-0 md:px-10 md:pb-8 md:pt-0 z-10">
        {/* Category + status badges */}
        <div className="mb-2 md:mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-light text-primary border border-[#C7D2FE] md:bg-white/90 md:text-primary md:border-transparent px-2.5 py-0.5 md:px-3 md:py-1 text-[11px] font-bold shadow-sm">
            {ev.category}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 md:px-3 md:py-1 text-[11px] font-bold shadow-sm ${
            registrationStatus === 'Registration closing soon'
              ? 'bg-[#FEF3C7] text-[#92400E]'
              : registrationStatus === 'Event ended'
              ? 'bg-surface-2 text-text-2 border border-border md:bg-white/80 md:border-transparent'
              : 'bg-[#DCFCE7] text-[#15803D]'
          }`}>
            {registrationStatus}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-heading font-bold text-text-1 md:text-white text-[22px] sm:text-[26px] md:text-[40px] leading-tight tracking-tight mb-1 drop-shadow-none md:drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] break-words">
          {ev.name}
        </h1>
        <p className="text-text-3 md:text-white/80 text-[13px] md:text-[14px] font-medium drop-shadow-none md:drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] mb-3.5 md:mb-4">
          {ev.college} · {ev.city}
        </p>

        {/* Quick info pills (grid on mobile, flex row on desktop) */}
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:gap-2">
          {ev.startDate && (
            <div className="flex items-start md:items-center gap-2 p-2.5 md:px-3 md:py-2 rounded-lg bg-surface border border-border text-text-1 md:bg-white/15 md:backdrop-blur-sm md:border-white/20 md:text-white min-w-0">
              <CalendarDays size={14} className="flex-shrink-0 text-primary md:text-white mt-0.5 md:mt-0" />
              <div className="min-w-0">
                <div className="text-[9px] font-mono tracking-[0.14em] uppercase text-text-4 md:text-white/60">Date</div>
                <div className="text-[12px] md:text-[13px] font-semibold leading-snug break-words">{ev.endDate ? `${ev.startDate} – ${ev.endDate}` : ev.startDate}</div>
              </div>
            </div>
          )}
          {ev.venue && (
            <div className="flex items-start md:items-center gap-2 p-2.5 md:px-3 md:py-2 rounded-lg bg-surface border border-border text-text-1 md:bg-white/15 md:backdrop-blur-sm md:border-white/20 md:text-white min-w-0">
              <MapPin size={14} className="flex-shrink-0 text-primary md:text-white mt-0.5 md:mt-0" />
              <div className="min-w-0">
                <div className="text-[9px] font-mono tracking-[0.14em] uppercase text-text-4 md:text-white/60">Venue</div>
                <div className="text-[12px] md:text-[13px] font-semibold leading-snug break-words">{ev.venue}</div>
              </div>
            </div>
          )}
          {mode && (
            <div className="flex items-start md:items-center gap-2 p-2.5 md:px-3 md:py-2 rounded-lg bg-surface border border-border text-text-1 md:bg-white/15 md:backdrop-blur-sm md:border-white/20 md:text-white min-w-0">
              {mode === 'Online' ? <Monitor size={14} className="flex-shrink-0 text-primary md:text-white mt-0.5 md:mt-0" /> : <Building2 size={14} className="flex-shrink-0 text-primary md:text-white mt-0.5 md:mt-0" />}
              <div className="min-w-0">
                <div className="text-[9px] font-mono tracking-[0.14em] uppercase text-text-4 md:text-white/60">Mode</div>
                <div className="text-[12px] md:text-[13px] font-semibold leading-snug break-words">{mode}</div>
              </div>
            </div>
          )}
          <div className="flex items-start md:items-center gap-2 p-2.5 md:px-3 md:py-2 rounded-lg bg-surface border border-border text-text-1 md:bg-white/15 md:backdrop-blur-sm md:border-white/20 md:text-white min-w-0">
            <IndianRupee size={14} className="flex-shrink-0 text-primary md:text-white mt-0.5 md:mt-0" />
            <div className="min-w-0">
              <div className="text-[9px] font-mono tracking-[0.14em] uppercase text-text-4 md:text-white/60">Entry</div>
              <div className="text-[12px] md:text-[13px] font-semibold leading-snug break-words">{ev.price || 'Free'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ══ SECTION NAVIGATION ══ */}
    <SectionNav items={navItems} activeId={activeSection} />

    {/* ══ MAIN CONTENT ══ */}
    <div id="overview" ref={setSectionRef('overview')} className="mx-auto max-w-[1280px] w-full max-w-full overflow-x-hidden px-4 sm:px-6 md:px-8 md:grid md:grid-cols-[minmax(0,1fr)_360px] md:items-start md:gap-9">

      {/* ── LEFT COLUMN ── */}
      <div className="flex flex-col gap-5 sm:gap-6 md:gap-7 min-w-0 w-full">

        {/* Tags */}
        {ev.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ev.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 text-[12px] font-semibold bg-surface border border-border rounded-full text-text-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── ABOUT THIS EVENT ── */}
        {safeAbout && (
          <section id="about" ref={setSectionRef('about')} className="scroll-mt-24 md:scroll-mt-28 rounded-xl border border-border bg-white p-4 sm:p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <SectionHeading number={1}>About this Event</SectionHeading>
            <MultilineText
              text={showFullAbout ? safeAbout : aboutShort}
              className="text-[14px] md:text-[15px] text-text-2 break-words"
            />
            {!showFullAbout && safeAbout.length > 240 && (
              <span className="text-[14px] md:text-[15px] text-text-2">…</span>
            )}
            {safeAbout.length > 240 && (
              <button onClick={() => setShowFullAbout(v => !v)}
                className="text-[13px] font-semibold text-primary mt-2 hover:underline block">
                {showFullAbout ? 'Show less ↑' : 'Read more ↓'}
              </button>
            )}
          </section>
        )}

        {/* ── COMPETITION MANAGER (owner only) ── */}
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

        {/* ── COMPETITIONS & ACTIVITIES ── */}
        {individualCompetitions.length > 0 && (
          <section id="competitions" ref={setSectionRef('competitions')} className="scroll-mt-24 md:scroll-mt-28 rounded-xl border border-border bg-white p-4 sm:p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <SectionHeading number={2}>Competitions & Activities</SectionHeading>
            <div className="text-[12px] font-medium text-text-4 mb-3">{individualCompetitions.length} available</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {individualCompetitions.map((competition, competitionIndex) => (
                <button type="button" key={competition._id || competition.name} onClick={() => setSelectedCompetition(competitionIndex)}
                  className="w-full rounded-xl border border-border bg-surface p-4 text-left shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary-mid hover:shadow-[0_6px_16px_rgba(79,70,229,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  <div className="mb-3 flex items-start gap-3">
                    <span className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-[12px] font-bold text-primary">{competitionIndex + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-heading text-[15px] font-bold leading-snug text-text-1 break-words">{competition.name}</div>
                      {competition.eligibility && <div className="mt-1 line-clamp-1 text-[11px] font-semibold text-primary">{competition.eligibility}</div>}
                    </div>
                  </div>
                  {competition.description && <p className="mb-3 line-clamp-2 text-[12px] leading-relaxed text-text-3 break-words">{sanitizeText(competition.description)}</p>}
                  <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
                    <div><div className="text-[10px] font-bold uppercase tracking-wider text-text-4">Fee</div><div className="mt-0.5 truncate text-[12px] font-semibold text-text-1">{competition.registrationFee || 'Free'}</div></div>
                    <div><div className="text-[10px] font-bold uppercase tracking-wider text-text-4">Venue</div><div className="mt-0.5 truncate text-[12px] font-semibold text-text-1">{competition.venue || 'See details'}</div></div>
                  </div>
                  <div className="mt-3 text-[12px] font-bold text-primary flex items-center gap-1">Tap for details <span aria-hidden="true">→</span></div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── PERKS & PRIZES (unified section) ── */}
        {(perks || hasPrizes || ev.highlights?.length > 0) && (
          <section id="benefits" ref={setSectionRef('benefits')} className="scroll-mt-24 md:scroll-mt-28 rounded-xl border border-border bg-white p-4 sm:p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <SectionHeading number={3}>
              <span className="flex items-center gap-2"><Gift size={18} strokeWidth={1.8} className="text-primary" /> Perks & Prizes</span>
            </SectionHeading>

            {/* Highlights / What You Get */}
            {ev.highlights?.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-2">What you get</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ev.highlights.map((h, i) => (
                    <motion.div key={h} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.16, delay: i * 0.04 }}
                      className="flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-surface rounded-lg border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-primary-mid hover:shadow-[0_2px_8px_rgba(79,70,229,0.09)] transition-all duration-fast min-w-0">
                      <span className="text-[18px] sm:text-[20px] flex-shrink-0">{h.slice(0, 2)}</span>
                      <span className="text-[13px] font-medium text-text-1 leading-snug break-words">{h.slice(2).trim()}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Perks */}
            {perks && (
              <div className="mb-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-text-4 mb-2">Other perks</div>
                <div className="flex flex-wrap gap-2">
                  {perks.split(',').map(p => p.trim()).filter(Boolean).map(perk => (
                    <span key={perk}
                      className="px-3 py-1.5 text-[13px] font-medium bg-surface-2 border border-border rounded-md text-text-2 break-words">
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prize Podium */}
            {hasPrizes && <PrizePodium prizes={prizes} />}
          </section>
        )}

        {/* ── ELIGIBILITY & RULES ── */}
        {(eligibility || rules) && (
          <section className="scroll-mt-24 md:scroll-mt-28 rounded-xl border border-border bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden" aria-labelledby="rules-heading">
            <button
              onClick={() => setRulesOpen(o => !o)}
              className="flex items-center justify-between w-full p-4 sm:p-5 text-left group">
              <div className="flex items-center gap-2">
                <ScrollText size={17} strokeWidth={1.8} className="text-text-3 flex-shrink-0" />
                <span id="rules-heading" className="font-heading font-bold text-[16px] sm:text-[17px] text-text-1">Eligibility & Rules</span>
              </div>
              <motion.div animate={{ rotate: rulesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={18} className="text-text-3 flex-shrink-0" />
              </motion.div>
            </button>
            <AnimatePresence>
              {rulesOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                  className="overflow-hidden">
                  <div className="space-y-3 sm:space-y-4 px-4 sm:px-5 pb-4 sm:pb-5">
                    {eligibility && (
                      <div className="bg-surface rounded-lg p-3.5 sm:p-4 border border-border">
                        <div className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-text-4 mb-1.5 sm:mb-2">Who can participate</div>
                        <MultilineText text={eligibility} className="text-[13px] sm:text-[14px] text-text-2 break-words" />
                      </div>
                    )}
                    {rules && (
                      <div className="bg-surface rounded-lg p-3.5 sm:p-4 border border-border">
                        <div className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-text-4 mb-1.5 sm:mb-2">Rules</div>
                        <MultilineText text={rules} className="text-[13px] sm:text-[14px] text-text-2 break-words" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* ── ORGANIZER ── */}
        {ev.orgName && (
          <section id="organizer" ref={setSectionRef('organizer')} className="scroll-mt-24 md:scroll-mt-28 rounded-xl border border-border bg-white p-4 sm:p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <SectionHeading number={4}>Organiser</SectionHeading>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-surface-2 flex items-center justify-center text-[24px] sm:text-[28px] flex-shrink-0 border border-border">
                  {ev.orgLogo}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[15px] sm:text-[16px] text-text-1 mb-0.5 break-words">{ev.orgName}</div>
                  <div className="text-[12px] sm:text-[13px] text-text-3 truncate">{ev.orgLocation}</div>
                  {ev.orgSub && <div className="text-[11px] sm:text-[12px] text-text-4 mt-0.5 truncate">{ev.orgSub}</div>}
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.94 }}
                onClick={() => { setFollowed(f => !f); showToast(followed ? 'Unfollowed' : `Following ${ev.orgName} ✓`, 'success'); }}
                className={`self-start sm:self-center flex-shrink-0 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-[12px] sm:text-[13px] font-semibold border transition-all duration-fast min-h-[38px]
                  ${followed ? 'bg-primary text-white border-primary shadow-indigo' : 'bg-primary-light text-primary border-[#C7D2FE] hover:bg-primary hover:text-white'}`}>
                {followed ? '✓ Following' : '+ Follow'}
              </motion.button>
            </div>
          </section>
        )}

        {/* ── BROCHURE ── */}
        {brochureUrl && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-3.5 sm:p-4 shadow-[0_1px_6px_rgba(180,83,9,0.07)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#B45309]/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={22} strokeWidth={1.6} className="text-[#B45309]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[13px] sm:text-[14px] text-text-1 leading-snug truncate">Event Brochure</div>
                  <div className="text-[11px] sm:text-[12px] text-text-3 mt-0.5 truncate">PDF · Official document</div>
                </div>
              </div>
              <button onClick={handleDownloadBrochure}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-semibold text-[#B45309] bg-white border border-[#FED7AA] hover:bg-[#B45309] hover:text-white transition-all duration-fast flex-shrink-0 min-h-[36px]">
                <Download size={13} strokeWidth={2.2} />
                <span>Download</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── CONTACT INFORMATION ── */}
        {(pocName || pocPhone || pocEmail || website) && (
          <section id="contact" ref={setSectionRef('contact')} className="scroll-mt-24 md:scroll-mt-28 rounded-xl border border-border bg-white p-4 sm:p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <SectionHeading>
              <span className="flex items-center gap-2"><Phone size={17} strokeWidth={1.8} className="text-text-2" /> Contact Information</span>
            </SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {pocName && (
                <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                    <UserRound size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-text-4 uppercase tracking-wide font-bold">Point of Contact</div>
                    <div className="text-[13px] sm:text-[14px] font-semibold text-text-1 truncate">{pocName}</div>
                  </div>
                </div>
              )}
              {pocPhone && (
                <a href={`tel:${pocPhone}`}
                  className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border hover:border-[#16A34A] hover:shadow-[0_2px_8px_rgba(22,163,74,0.1)] transition-all group min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-green-bg flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-[#16A34A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-text-4 uppercase tracking-wide font-bold">Phone</div>
                    <div className="text-[13px] sm:text-[14px] font-semibold text-text-1 group-hover:text-[#16A34A] transition-colors truncate">{pocPhone}</div>
                  </div>
                  <ChevronDown size={14} className="text-text-3 -rotate-90 flex-shrink-0" />
                </a>
              )}
              {pocEmail && (
                <a href={`mailto:${pocEmail}`}
                  className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border hover:border-primary hover:shadow-[0_2px_8px_rgba(79,70,229,0.1)] transition-all group min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                    <Mail size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-text-4 uppercase tracking-wide font-bold">Email</div>
                    <div className="text-[13px] sm:text-[14px] font-semibold text-text-1 group-hover:text-primary transition-colors truncate break-all">{pocEmail}</div>
                  </div>
                  <ChevronDown size={14} className="text-text-3 -rotate-90 flex-shrink-0" />
                </a>
              )}
              {website && website !== '#' && (
                <a href={website} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border hover:border-[#B45309] hover:shadow-[0_2px_8px_rgba(180,83,9,0.1)] transition-all group min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] flex items-center justify-center flex-shrink-0">
                    <Globe size={16} className="text-[#B45309]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-text-4 uppercase tracking-wide font-bold">Website</div>
                    <div className="text-[13px] sm:text-[14px] font-semibold text-[#B45309] truncate break-all">{website.replace(/^https?:\/\//, '')}</div>
                  </div>
                  <ExternalLink size={14} className="text-text-3 flex-shrink-0" />
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        {faqItems.length > 0 && (
          <section id="faq" ref={setSectionRef('faq')} className="scroll-mt-24 md:scroll-mt-28 rounded-xl border border-border bg-white p-4 sm:p-5 md:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]" aria-labelledby="faq-heading">
            <SectionHeading number={5}>Frequently Asked Questions</SectionHeading>
            <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
              {faqItems.map(([question, answer]) => (
                <FaqItem key={question} question={question} answer={answer} />
              ))}
            </div>
          </section>
        )}

        {/* ── Featured Events — mobile/tablet only ── */}
        {featuredEvs.length > 0 && (
          <div className="md:hidden">
            <SectionHeading><span className="flex items-center gap-2"><Star size={17} strokeWidth={1.8} className="text-amber-500" /> Featured Events</span></SectionHeading>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featuredEvs.slice(0, 4).map(f => (
                <RelatedCard key={f.id} ev={f} onClick={() => navigate(`/event/${f.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Related ── */}
        {related.length > 0 && (
          <div className="scroll-mt-24 md:scroll-mt-28">
            <SectionHeading>More {ev.category}s</SectionHeading>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {related.map(r => <RelatedCard key={r.id} ev={r} onClick={() => navigate(`/event/${r.id}`)} />)}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN (desktop) ── */}
      <div className="hidden md:flex md:flex-col md:gap-5 sticky top-[130px]">
        <ActionPanel ev={ev} cfg={cfg} registering={registering} registered={registered}
          isSaved={isSaved} onToggleSave={() => { setUserToggled(true); toggleSave(ev.id); }} handleRegister={handleRegister} showToast={showToast} />

        {/* Featured Events sidebar */}
        {(featuredLoading || featuredEvs.length > 0) && (
          <div className="flex flex-col gap-4">
            <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-text-3 px-0.5">
              Featured on FestNest
            </div>
            {featuredLoading ? (
              <>
                {[0, 1].map(i => (
                  <div key={i} className="rounded-[18px] overflow-hidden border border-border bg-white">
                    <div className="skeleton w-full" style={{ paddingTop: '56.25%', borderRadius: 0 }} />
                    <div className="p-4 space-y-2">
                      <div className="skeleton h-3 w-16" />
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-3 w-1/2" />
                      <div className="skeleton h-9 mt-2" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              featuredEvs.slice(0, 2).map(f => (
                <FeaturedEventCard key={f.id} event={f} className="w-full" />
              ))
            )}
          </div>
        )}
      </div>
    </div>

    {/* ══ MOBILE STICKY CTA ══ */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[50] bg-white/97 backdrop-blur-[20px] border-t border-border px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className={`font-mono font-bold text-[22px] leading-none ${ev.entryType==='free'?'text-[#16A34A]':ev.entryType==='paid'?'text-[#B45309]':'text-primary'}`}>
            {ev.price}
          </div>
          <div className="text-[11px] text-text-3 mt-0.5">{ev.priceNote}</div>
        </div>
        {ev.deadlineDays > 0 && ev.deadlineDays <= 6 && (
          <div className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold
            ${ev.deadlineDays<=3 ? 'bg-red-bg text-red border border-red-border' : 'bg-amber-bg text-amber border border-amber-border'}`}>
            {ev.deadlineDays}d left
          </div>
        )}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
          onClick={handleRegister} disabled={registering || registered}
          className={`flex-1 py-[14px] rounded-md font-body text-[15px] font-bold text-white flex items-center justify-center gap-2 transition-all duration-fast disabled:opacity-70
            ${registered ? 'bg-[#16A34A]' : `${cfg.color} ${cfg.shadow}`}`}>
          <AnimatePresence mode="wait">
            {registering ? (
              <motion.span key="s" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              </motion.span>
            ) : registered ? (
              <motion.span key="d" initial={{scale:0.6,opacity:0}} animate={{scale:1,opacity:1}} className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                Registered!
              </motion.span>
            ) : (
              <motion.span key="c" initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2">
                {cfg.label}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out"
          role="dialog" aria-modal="true" aria-label={`${ev.name} image`}>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 text-white hover:bg-white/25 transition-all"
            aria-label="Close image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18M6 6l12 12"/></svg>
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
