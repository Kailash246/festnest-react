import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Users, AlertTriangle, HelpCircle, CalendarDays, Clock, MapPin,
  Monitor, Globe, Building2, Trophy, IndianRupee, Gift, ScrollText, Phone,
  Star, FileText, Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { events as eventsApi } from '../services/api';
import { normaliseEvent, normaliseEvents } from '../services/normalise';
import FeaturedEventCard from '../components/FeaturedEventCard';

/* ── bg → gradient (unchanged) ── */
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

/* ── Skeleton ── */
const DetailSkeleton = () => (
  <div className="min-h-screen bg-white animate-pulse">
    <div className="h-[320px] bg-surface-3 w-full" />
    <div className="px-4 mt-4 space-y-4">
      <div className="flex gap-3">{[1,2,3].map(i => <div key={i} className="h-[72px] w-[80px] bg-surface-3 rounded-lg flex-shrink-0" />)}</div>
      <div className="h-5 w-2/3 bg-surface-3 rounded-full" />
      <div className="h-4 w-full bg-surface-3 rounded-full" />
      <div className="h-4 w-5/6 bg-surface-3 rounded-full" />
    </div>
  </div>
);

/* ── StatPill ── */
const StatPill = ({ icon, value, label }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-3 bg-white/85 backdrop-blur-sm rounded-lg border border-white/60 shadow-[0_1px_4px_rgba(0,0,0,0.07)] flex-shrink-0">
    <div className="flex items-center justify-center w-[22px] h-[22px]">{icon}</div>
    <div className="font-display font-bold text-[16px] text-text-1 leading-none">{value}</div>
    <div className="text-[11px] text-text-3 font-medium">{label}</div>
  </div>
);

/* ── InfoCell ── */
const InfoCell = ({ icon, label, value, accent }) => (
  <div className={`rounded-md p-4 flex flex-col gap-1.5 border ${accent ? 'bg-primary-light border-[#C7D2FE]' : 'bg-surface border-border'}`}>
    <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-text-4">
      <span className="flex-shrink-0">{icon}</span>{label}
    </div>
    <div className={`text-[13px] font-semibold leading-snug ${accent ? 'text-primary' : 'text-text-1'}`}>{value}</div>
  </div>
);

/* ── Section heading ── */
const SectionHeading = ({ children }) => (
  <h2 className="font-display font-bold text-[17px] text-text-1 tracking-snug mb-3">{children}</h2>
);

/* ── Prize podium card ── */
const PrizePodium = ({ prizes }) => {
  const { first, second, third, total, pool } = prizes;
  if (!first && !second && !third && !total && !pool) return null;
  const podium = [
    { rankLabel: '1st', label: '1st Prize', value: first,  bg: 'bg-[#FFFBEB] border-[#FDE68A]', text: 'text-[#B45309]' },
    { rankLabel: '2nd', label: '2nd Prize', value: second, bg: 'bg-[#F8FAFC] border-[#CBD5E1]', text: 'text-[#475569]' },
    { rankLabel: '3rd', label: '3rd Prize', value: third,  bg: 'bg-[#FFF7ED] border-[#FED7AA]', text: 'text-[#9A3412]' },
  ].filter(p => p.value);

  return (
    <div className="mb-6">
      <SectionHeading><span className="flex items-center gap-2"><Trophy size={17} strokeWidth={1.8} className="text-amber-500" /> Prize Pool</span></SectionHeading>
      {podium.length > 0 && (
        <div className={`grid gap-3 mb-3 ${podium.length === 1 ? 'grid-cols-1' : podium.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {podium.map(({ rankLabel, label, value, bg, text }) => (
            <div key={label} className={`border rounded-lg p-4 text-center ${bg}`}>
              <div className={`text-[14px] font-bold mb-1 ${text}`}>{rankLabel}</div>
              <div className={`font-display font-bold text-[16px] ${text}`}>₹{Number(value.replace(/,/g,'')).toLocaleString('en-IN')}</div>
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
          <span className="font-display font-bold text-[18px] text-primary">₹{total || pool}</span>
        </div>
      )}
    </div>
  );
};

/* ── Related card ── */
const RelatedCard = ({ ev, onClick }) => (
  <motion.button whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.10)' }} whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex-shrink-0 w-[180px] bg-surface border border-border rounded-md overflow-hidden text-left cursor-pointer transition-all duration-base">
    <div className={`w-full h-[90px] flex items-center justify-center text-[40px] ${ev.bg}`}>
      {ev.imageUrl ? <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover" /> : ev.emoji}
    </div>
    <div className="p-3">
      <div className="text-[10px] font-bold tracking-wider uppercase text-primary mb-0.5">{ev.category}</div>
      <div className="font-display font-bold text-[13px] text-text-1 leading-snug tracking-snug"
        style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{ev.name}</div>
      <div className="text-[11px] text-text-3 mt-1">{ev.city}</div>
    </div>
  </motion.button>
);

/* ── Price card (desktop sidebar) ── */
function PriceCard({ ev, cfg, registering, registered, isSaved, toggleSave, handleRegister, showToast }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-surface border border-border rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
      {/* Price header */}
      <div className={`px-6 pt-6 pb-5 border-b border-border
        ${ev.entryType==='free'  ? 'bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]'
        : ev.entryType==='paid'  ? 'bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]'
                                  : 'bg-gradient-to-br from-primary-xlight to-primary-light'}`}>
        <div className="text-[11px] font-bold tracking-wider uppercase text-text-4 mb-1">Entry Fee</div>
        <div className={`font-display font-bold text-[36px] leading-none mb-1
          ${ev.entryType==='free' ? 'text-[#16A34A]' : ev.entryType==='paid' ? 'text-[#B45309]' : 'text-primary'}`}>
          {ev.price}
        </div>
        <div className="text-[13px] text-text-3">{ev.priceNote}</div>
      </div>

      {/* Quick info */}
      <div className="px-6 py-4 flex flex-col gap-3">
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

      {/* CTAs */}
      <div className="px-6 pb-6 flex flex-col gap-2.5">
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
          onClick={handleRegister} disabled={registering || registered}
          className={`w-full py-[14px] rounded-md font-body text-[15px] font-bold text-white flex items-center justify-center gap-2 transition-all duration-fast disabled:opacity-70
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
          <motion.button whileTap={{scale:0.94}} onClick={() => { setUserToggled(true); toggleSave(ev.id); }}
            className={`flex-1 py-3 rounded-md border-[1.5px] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all duration-fast
              ${isSaved ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-2 hover:border-primary hover:text-primary hover:bg-primary-xlight'}`}>
            <svg viewBox="0 0 24 24" fill={isSaved?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </motion.button>
        </div>
        <div className="text-center text-[12px] text-text-3 pt-1 flex items-center justify-center gap-1">
          <Users size={12} strokeWidth={1.8} /> {(ev.registrationCount||0).toLocaleString('en-IN')} students already registered
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function EventDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { savedEvents, toggleSave, showToast, requireAuth } = useApp();

  const [ev,            setEv]            = useState(null);
  const [related,       setRelated]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [registering,   setRegistering]   = useState(false);
  const [registered,    setRegistered]    = useState(false);
  const [followed,      setFollowed]      = useState(false);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [rulesOpen,     setRulesOpen]     = useState(false);
  // serverSaved = backend's isSaved from this event's API response.
  // Used as accurate initial state before AppContext finishes loading
  // its saved-events Set (which happens async on mount/login).
  const [serverSaved,   setServerSaved]   = useState(null);
  // Whether the user has explicitly toggled save on this page in this session
  const [userToggled,   setUserToggled]   = useState(false);
  const [featuredEvs,     setFeaturedEvs]     = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const heroRef = useRef(null);
  const { scrollY }   = useScroll();
  const emojiY        = useTransform(scrollY, [0, 300], [0, 60]);
  const heroOpacity   = useTransform(scrollY, [0, 200], [1, 0.6]);

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
        // Use the backend's authoritative isSaved value on first load
        if (typeof r.data.isSaved === 'boolean') setServerSaved(r.data.isSaved);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // After the user toggles save, trust the context Set (it's optimistically updated and
  // synced to the backend). Before any toggle, if the context Set is still loading (empty),
  // fall back to the server's authoritative isSaved from this event's API response.
  const isSaved = userToggled
    ? savedEvents.has(id)
    : (savedEvents.has(id) || serverSaved === true);
  const cfg     = ev ? (ENTRY_CONFIG[ev.entryType] || ENTRY_CONFIG.prize) : null;

  const handleRegister = async () => {
    if (registered) return;
    if (!requireAuth()) return;
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

  if (loading) return <DetailSkeleton />;

  if (error || !ev) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {error ? <AlertTriangle size={72} strokeWidth={1.3} className="text-amber mb-4" /> : <HelpCircle size={72} strokeWidth={1.3} className="text-text-3 mb-4" />}
      <h2 className="font-display font-bold text-[22px] text-text-1 tracking-tight mb-2">
        {error ? 'Could not load event' : 'Event not found'}
      </h2>
      <p className="text-[14px] text-text-3 mb-6">{error || 'This event may have ended or been removed.'}</p>
      <div className="flex gap-3">
        {error && <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-white rounded-md text-[14px] font-semibold hover:bg-primary-dark transition-colors">Retry</button>}
        <button onClick={() => navigate('/')} className="px-6 py-3 border border-border text-text-2 rounded-md text-[14px] font-semibold hover:border-primary hover:text-primary transition-colors">← Back to Home</button>
      </div>
    </div>
  );

  const aboutShort = ev.about?.slice(0, 240) || '';

  /* Parse extra fields from normalised event */
  const prizes = {
    first:  ev.prize1  || ev.prizeFirst  || '',
    second: ev.prize2  || ev.prizeSecond || '',
    third:  ev.prize3  || ev.prizeThird  || '',
    total:  ev.totalPrize || '',
    pool:   ev.prizeDetails || '',
  };
  const hasPrizes     = Object.values(prizes).some(Boolean) || ev.badgeClass === 'badge-prize';
  const eligibility   = ev.eligibility || '';
  const rules         = ev.rules       || '';
  const perks         = ev.perks       || '';
  const pocName       = ev.pocName     || '';
  const pocPhone      = ev.pocPhone    || ev.phone   || '';
  const pocEmail      = ev.pocEmail    || ev.email   || '';
  const website       = ev.website     || ev.registrationUrl || '';
  const mode          = ev.mode        || '';
  const brochureUrl   = ev.brochureUrl || '';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="min-h-screen bg-white w-full overflow-x-hidden pb-[120px] md:pb-12">

      {/* ══ HERO ══ */}
      <div ref={heroRef}
        className={`relative w-full overflow-hidden aspect-video md:aspect-auto md:min-h-[320px] bg-gradient-to-br ${BG_GRADIENT[ev.bg] || BG_GRADIENT.bg1}`}>

        {ev.imageUrl
          ? <img src={ev.imageUrl} alt={ev.name} className="absolute inset-0 w-full h-full object-cover" />
          : (
            <motion.div style={{ y: emojiY, opacity: heroOpacity }}
              className="absolute inset-0 flex items-center justify-center text-[160px] md:text-[220px] select-none pointer-events-none" aria-hidden>
              {ev.emoji}
            </motion.div>
          )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 md:px-10 md:pt-6 z-10">
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/80 backdrop-blur-sm text-[13px] font-medium text-text-1 border border-white/60 shadow-[0_1px_4px_rgba(0,0,0,0.1)] hover:bg-white transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: ev?.name, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href).catch(() => {});
                  showToast('Link copied! 📋', 'success');
                }
              }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-white/60 shadow-[0_1px_4px_rgba(0,0,0,0.1)] hover:bg-white transition-all text-text-2" aria-label="Share">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08 }} onClick={() => { setUserToggled(true); toggleSave(ev.id); }}
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full backdrop-blur-sm flex items-center justify-center border shadow-[0_1px_4px_rgba(0,0,0,0.1)] transition-all
                ${isSaved ? 'bg-primary text-white border-primary shadow-indigo' : 'bg-white/80 text-text-2 border-white/60 hover:bg-white'}`}
              aria-label={isSaved ? 'Remove from saved' : 'Save event'}>
              <svg viewBox="0 0 24 24" fill={isSaved?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[17px] h-[17px]"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </motion.button>
          </div>
        </div>

        {/* Hero bottom — desktop only (mobile shows title block below the image) */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0 px-4 pb-5 md:px-10 md:pb-7 z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-md border backdrop-blur-sm ${cfg.pill}`}>
              {ev.badgeText}
            </div>
            {mode && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-md bg-black/30 text-white border border-white/20 backdrop-blur-sm">
                {mode === 'Online' ? <Monitor size={11} strokeWidth={2} /> : mode === 'Hybrid' ? <Globe size={11} strokeWidth={2} /> : <Building2 size={11} strokeWidth={2} />} {mode}
              </div>
            )}
          </div>
          <h1 className="font-display font-bold text-white text-[26px] md:text-[36px] leading-tight tracking-tight mb-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            {ev.name}
          </h1>
          <p className="text-white/80 text-[14px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            {ev.college} · {ev.city}
          </p>
        </div>
      </div>

      {/* ══ MOBILE TITLE BLOCK (below image) ══ */}
      <div className="md:hidden px-4 pt-4 pb-2">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-md border ${cfg.pill}`}>
            {ev.badgeText}
          </div>
          {mode && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-md bg-surface-2 text-text-2 border border-border">
              {mode === 'Online' ? <Monitor size={11} strokeWidth={2} /> : mode === 'Hybrid' ? <Globe size={11} strokeWidth={2} /> : <Building2 size={11} strokeWidth={2} />} {mode}
            </div>
          )}
        </div>
        <h1 className="font-display font-bold text-[22px] text-text-1 leading-tight tracking-tight mb-1">
          {ev.name}
        </h1>
        <p className="text-[14px] text-text-3">{ev.college} · {ev.city}</p>
      </div>

      {/* ══ QUICK STATS ══ */}
      <div className="px-4 md:px-10 mt-2 md:-mt-4 mb-6 relative z-10 md:max-w-[900px] md:mx-auto">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {ev.deadlineDays > 0 && ev.deadlineDays <= 12 && (
            <StatPill icon={ev.deadlineDays<=3 ? <AlertTriangle size={18} strokeWidth={1.8} className="text-red" /> : ev.deadlineDays<=6 ? <Clock size={18} strokeWidth={1.8} className="text-amber" /> : <Clock size={18} strokeWidth={1.8} className="text-[#16A34A]" />} value={`${ev.deadlineDays}d`} label="Days left" />
          )}
          {ev.teamSize  && <StatPill icon={<Users size={18} strokeWidth={1.8} className="text-text-3" />} value={ev.teamSize}  label="Team size" />}
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="px-4 md:px-10 md:max-w-[900px] md:mx-auto md:grid md:grid-cols-[1fr_300px] md:gap-8 md:items-start">

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* Tags */}
          {ev.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {ev.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 text-[12px] font-semibold bg-surface border border-border rounded-md text-text-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ev.startDate && <InfoCell icon={<CalendarDays size={13} strokeWidth={1.8} />} label="Date"    value={ev.startDate} />}
            {ev.time      && <InfoCell icon={<Clock size={13} strokeWidth={1.8} />}        label="Time"    value={ev.time} />}
            {ev.venue     && <InfoCell icon={<MapPin size={13} strokeWidth={1.8} />}       label="Venue"   value={ev.venue} accent />}
            {ev.teamSize  && <InfoCell icon={<Users size={13} strokeWidth={1.8} />}        label="Team"    value={ev.teamSize} />}
            {ev.endDate   && <InfoCell icon={<CalendarDays size={13} strokeWidth={1.8} />} label="End Date" value={ev.endDate} />}
            {mode         && <InfoCell icon={mode==='Online' ? <Monitor size={13} strokeWidth={1.8} /> : mode==='Hybrid' ? <Globe size={13} strokeWidth={1.8} /> : <Building2 size={13} strokeWidth={1.8} />} label="Mode" value={mode} />}
          </div>

          {/* About */}
          {ev.about && (
            <div className="mb-6">
              <SectionHeading>About this Event</SectionHeading>
              <p className="text-[14px] md:text-[15px] text-text-2 leading-relaxed">
                {showFullAbout ? ev.about : aboutShort}
                {!showFullAbout && ev.about.length > 240 && '…'}
              </p>
              {ev.about.length > 240 && (
                <button onClick={() => setShowFullAbout(v => !v)}
                  className="text-[13px] font-semibold text-primary mt-2 hover:underline">
                  {showFullAbout ? 'Show less ↑' : 'Read more ↓'}
                </button>
              )}
            </div>
          )}

          {/* Highlights / What You Get */}
          {ev.highlights?.length > 0 && (
            <div className="mb-6">
              <SectionHeading>What You Get</SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ev.highlights.map((h, i) => (
                  <motion.div key={h} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.16, delay: i * 0.04 }}
                    className="flex items-center gap-3 px-4 py-3 bg-surface rounded-lg border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-primary-mid hover:shadow-[0_2px_8px_rgba(79,70,229,0.09)] transition-all duration-fast">
                    <span className="text-[20px] flex-shrink-0">{h.slice(0, 2)}</span>
                    <span className="text-[13px] font-medium text-text-1 leading-snug">{h.slice(2).trim()}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Perks */}
          {perks && (
            <div className="mb-6">
              <SectionHeading><span className="flex items-center gap-2"><Gift size={17} strokeWidth={1.8} className="text-text-2" /> Other Perks</span></SectionHeading>
              <div className="flex flex-wrap gap-2">
                {perks.split(',').map(p => p.trim()).filter(Boolean).map(perk => (
                  <span key={perk}
                    className="px-3 py-1.5 text-[13px] font-medium bg-surface-2 border border-border rounded-md text-text-2">
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prizes */}
          {hasPrizes && <PrizePodium prizes={prizes} />}

          {/* Eligibility & Rules */}
          {(eligibility || rules) && (
            <div className="mb-6">
              <button
                onClick={() => setRulesOpen(o => !o)}
                className="flex items-center justify-between w-full py-4 border-t border-border text-left group">
                <div className="flex items-center gap-2">
                  <ScrollText size={17} strokeWidth={1.8} className="text-text-3 flex-shrink-0" />
                  <SectionHeading>Eligibility &amp; Rules</SectionHeading>
                </div>
                <motion.div animate={{ rotate: rulesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-text-3"><polyline points="6 9 12 15 18 9"/></svg>
                </motion.div>
              </button>
              <AnimatePresence>
                {rulesOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                    className="overflow-hidden">
                    <div className="space-y-4 pb-4">
                      {eligibility && (
                        <div className="bg-surface rounded-lg p-4 border border-border">
                          <div className="text-[11px] font-bold tracking-wider uppercase text-text-4 mb-2">Who can participate</div>
                          <p className="text-[14px] text-text-2 leading-relaxed">{eligibility}</p>
                        </div>
                      )}
                      {rules && (
                        <div className="bg-surface rounded-lg p-4 border border-border">
                          <div className="text-[11px] font-bold tracking-wider uppercase text-text-4 mb-2">Rules</div>
                          <p className="text-[14px] text-text-2 leading-relaxed whitespace-pre-line">{rules}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Organiser */}
          {ev.orgName && (
            <div className="mb-6">
              <SectionHeading>Organiser</SectionHeading>
              <div className="flex items-center gap-4 p-4 bg-surface rounded-lg border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center text-[24px] flex-shrink-0 border border-border">
                  {ev.orgLogo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px] text-text-1 mb-0.5">{ev.orgName}</div>
                  <div className="text-[12px] text-text-3">{ev.orgLocation}</div>
                  <div className="text-[12px] text-text-4 mt-0.5">{ev.orgSub}</div>
                </div>
                <motion.button whileTap={{ scale: 0.94 }}
                  onClick={() => { setFollowed(f => !f); showToast(followed ? 'Unfollowed' : `Following ${ev.orgName} ✓`, 'success'); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-md text-[13px] font-semibold border transition-all duration-fast
                    ${followed ? 'bg-primary text-white border-primary shadow-indigo' : 'bg-primary-light text-primary border-[#C7D2FE] hover:bg-primary hover:text-white'}`}>
                  {followed ? '✓ Following' : '+ Follow'}
                </motion.button>
              </div>
            </div>
          )}

          {/* Brochure */}
          {brochureUrl && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="mb-6">
              <div className="flex items-center gap-4 px-4 py-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg shadow-[0_1px_6px_rgba(180,83,9,0.07)]">
                <div className="w-12 h-12 rounded-lg bg-[#B45309]/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} strokeWidth={1.6} className="text-[#B45309]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14px] text-text-1 leading-snug">Event Brochure</div>
                  <div className="text-[12px] text-text-3 mt-0.5">PDF · Official document</div>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <button onClick={handleDownloadBrochure}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-semibold text-[#B45309] bg-white border border-[#FED7AA] hover:bg-[#B45309] hover:text-white transition-all duration-fast">
                    <Download size={13} strokeWidth={2.2} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contact */}
          {(pocName || pocPhone || pocEmail || website) && (
            <div className="mb-6">
              <SectionHeading><span className="flex items-center gap-2"><Phone size={17} strokeWidth={1.8} className="text-text-2" /> Contact Information</span></SectionHeading>
              <div className="bg-white border border-border rounded-md overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                {pocName && (
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-b-0">
                    <div className="w-8 h-8 rounded-md bg-primary-light flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <div className="text-[11px] text-text-4 uppercase tracking-wide font-bold">Point of Contact</div>
                      <div className="text-[14px] font-semibold text-text-1">{pocName}</div>
                    </div>
                  </div>
                )}
                {pocPhone && (
                  <a href={`tel:${pocPhone}`}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors group">
                    <div className="w-8 h-8 rounded-md bg-green-bg flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.29 2 2 0 0 1 3.63 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] text-text-4 uppercase tracking-wide font-bold">Phone</div>
                      <div className="text-[14px] font-semibold text-text-1 group-hover:text-[#16A34A] transition-colors">{pocPhone}</div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-3"><path d="m9 18 6-6-6-6"/></svg>
                  </a>
                )}
                {pocEmail && (
                  <a href={`mailto:${pocEmail}`}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors group">
                    <div className="w-8 h-8 rounded-md bg-primary-light flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-text-4 uppercase tracking-wide font-bold">Email</div>
                      <div className="text-[14px] font-semibold text-text-1 group-hover:text-primary transition-colors truncate">{pocEmail}</div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-3"><path d="m9 18 6-6-6-6"/></svg>
                  </a>
                )}
                {website && website !== '#' && (
                  <a href={website} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-3.5 last:border-b-0 hover:bg-surface-2 transition-colors group">
                    <div className="w-8 h-8 rounded-md bg-[#FFF7ED] flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-text-4 uppercase tracking-wide font-bold">Website</div>
                      <div className="text-[14px] font-semibold text-[#B45309] truncate">{website.replace(/^https?:\/\//, '')}</div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-3"><path d="m9 18 6-6-6-6"/></svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Featured Events — mobile/tablet only; desktop shows in right sidebar */}
          {featuredEvs.length > 0 && (
            <div className="mb-6 md:hidden">
              <SectionHeading><span className="flex items-center gap-2"><Star size={17} strokeWidth={1.8} className="text-amber-500" /> Featured Events</span></SectionHeading>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {featuredEvs.slice(0, 4).map(f => (
                  <FeaturedEventCard key={f.id} event={f} className="w-[240px]" />
                ))}
              </div>
            </div>
          )}

          {/* Related */}
          {related.length > 0 && (
            <div className="mb-6">
              <SectionHeading>More {ev.category}s</SectionHeading>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {related.map(r => <RelatedCard key={r.id} ev={r} onClick={() => navigate(`/event/${r.id}`)} />)}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN (desktop) ── */}
        <div className="hidden md:flex md:flex-col md:gap-5 sticky top-[80px]">
          <PriceCard ev={ev} cfg={cfg} registering={registering} registered={registered}
            isSaved={isSaved} toggleSave={toggleSave} handleRegister={handleRegister} showToast={showToast} />

          {/* Featured Events sidebar — same pattern as HostEvent */}
          {(featuredLoading || featuredEvs.length > 0) && (
            <div className="flex flex-col gap-4">
              <div className="text-[11px] font-bold tracking-[0.07em] uppercase text-text-3 px-0.5">
                Featured on FestNest
              </div>
              {featuredLoading ? (
                <>
                  {[0, 1].map(i => (
                    <div key={i} className="bg-white border border-[#E4E4E0] rounded-[18px] overflow-hidden animate-pulse">
                      <div className="h-[140px] bg-surface-3" />
                      <div className="p-4 space-y-2">
                        <div className="h-2.5 w-16 bg-surface-3 rounded-full" />
                        <div className="h-4 w-3/4 bg-surface-3 rounded-full" />
                        <div className="h-3 w-1/2 bg-surface-3 rounded-full" />
                        <div className="h-9 bg-surface-3 rounded-[10px] mt-2" />
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
            <div className={`font-display font-bold text-[22px] leading-none ${ev.entryType==='free'?'text-[#16A34A]':ev.entryType==='paid'?'text-[#B45309]':'text-primary'}`}>
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

    </motion.div>
  );
}
