import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Timer, Star, CalendarDays, Code2, Music4, Wrench, Ticket, Trophy, AlertTriangle, Search, MapPin, PartyPopper, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import EventCard from '../components/EventCard';
import Seo, { SITE_URL, DEFAULT_OG_IMAGE } from '../components/Seo';
import { events as eventsApi, admin as adminApi } from '../services/api';
import { normaliseEvents } from '../services/normalise';
import { PRIORITY_CATEGORIES } from '../data/categories';
import { FilterSheet, SortDropdown, ActivePill, CITIES, ENTRY, SORT_OPT } from '../components/EventFilters';

/* Organization + WebSite structured data for the homepage. */
const HOME_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FestNest',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    image: DEFAULT_OG_IMAGE,
    description:
      "FestNest is India's home for college events — discover and register for hackathons, cultural fests, workshops, competitions, and internships at colleges across India.",
    areaServed: { '@type': 'Country', name: 'India' },
    founder: { '@type': 'Person', name: 'Kailash Kumar B', url: `${SITE_URL}/about` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FestNest',
    url: SITE_URL,
  },
];

/* ─────────────────────────────────────────
   FILTER CONFIG
   Priority categories lead the quick-filter row, between the
   "All / This Week" shortcuts and the "Free / Prize" entry filters.
───────────────────────────────────────── */
const CHIP_FILTERS = [
  { label: 'All Events',    value: 'all',  Icon: Star },
  { label: 'This Week',     value: 'week', Icon: CalendarDays },
  ...PRIORITY_CATEGORIES.map(c => ({ label: c.label, value: c.value, Icon: c.Icon })),
  { label: 'Free Entry',    value: 'free',  Icon: Ticket },
  { label: 'Prize Pool',    value: 'prize', Icon: Trophy },
];

/* ─────────────────────────────────────────
   ICONS  (unchanged)
───────────────────────────────────────── */
const FireIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[11px] h-[11px] text-red">
    <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z"/>
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px]">
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

/* ─────────────────────────────────────────
   SKELETON CARD  (loading placeholder)
───────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-[18px] overflow-hidden border border-border bg-white">
    <div className="skeleton w-full" style={{ paddingTop: '56.25%' }} />
    <div className="p-3 space-y-2">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="flex justify-between mt-2">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-3 w-1/4" />
      </div>
    </div>
  </div>
);

const SkeletonHScroll = ({ count = 4, wide }) => (
  <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`flex-shrink-0 ${wide ? 'w-[236px]' : 'w-[196px]'} bg-white border border-border rounded-md overflow-hidden`}>
        <div className={`skeleton ${wide ? 'h-[78px] w-[78px]' : 'h-[116px] w-full'}`} style={{ borderRadius: 0 }} />
        <div className="p-3 space-y-2">
          <div className="skeleton h-3 w-2/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────
   APPLY FILTER LOGIC  (client-side on API data)
───────────────────────────────────────── */
function applyFilters(events, chipCategory, sheetFilters, searchVal) {
  let result = [...events];
  if (searchVal.trim()) {
    const q = searchVal.toLowerCase();
    result = result.filter(ev =>
      ev.name.toLowerCase().includes(q) || ev.college.toLowerCase().includes(q) ||
      ev.city.toLowerCase().includes(q) || ev.category.toLowerCase().includes(q)
    );
  }
  if (chipCategory && chipCategory !== 'all') {
    if (chipCategory === 'free')       result = result.filter(ev => ev.entryType === 'free');
    else if (chipCategory === 'prize') result = result.filter(ev => ev.entryType === 'prize');
    else if (chipCategory === 'week')  result = result.filter(ev => ev.deadlineDays <= 7);
    else                               result = result.filter(ev => ev.category === chipCategory);
  }
  if (sheetFilters.category) result = result.filter(ev => ev.category === sheetFilters.category);
  if (sheetFilters.entry && sheetFilters.entry !== 'All') {
    if      (sheetFilters.entry === 'Free')       result = result.filter(ev => ev.entryType === 'free');
    else if (sheetFilters.entry === 'Paid')       result = result.filter(ev => ev.entryType === 'paid');
    else if (sheetFilters.entry === 'Prize Pool') result = result.filter(ev => ev.entryType === 'prize');
  }
  if (sheetFilters.city) result = result.filter(ev => ev.city === sheetFilters.city);
  switch (sheetFilters.sort) {
    case 'Oldest':          result.sort((a, b) => b.deadlineDays - a.deadlineDays); break;
    case 'Most Registered': result.sort((a, b) => b.registrationCount - a.registrationCount); break;
    case 'Deadline Soon':   result.sort((a, b) => a.deadlineDays - b.deadlineDays); break;
    default:                result.sort((a, b) => a.deadlineDays - b.deadlineDays); break;
  }
  return result;
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function Home() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const { notifBannerVisible, setNotifBannerVisible, showToast,
          homeFeedCache, homeFeedCacheTime, setHomeFeedCache, setHomeFeedCacheTime } = useApp();

  const CACHE_TTL  = 5 * 60 * 1000;
  const cacheValid = homeFeedCache && (Date.now() - homeFeedCacheTime < CACHE_TTL);
  const cacheRef   = useRef({ cache: homeFeedCache, cacheTime: homeFeedCacheTime });
  cacheRef.current = { cache: homeFeedCache, cacheTime: homeFeedCacheTime };

  const [searchVal,       setSearchVal]       = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chipCategory,    setChipCategory]    = useState('all');
  const [filterOpen,      setFilterOpen]      = useState(false);
  const [sheetFilters,    setSheetFilters]    = useState({ category: null, entry: null, city: null, sort: 'Latest' });

  /* ── API state (lazy-initialised from cache when available) ── */
  const [allEvents,   setAllEvents]   = useState(() => cacheValid ? homeFeedCache.allEvents : []);
  const [trending,    setTrending]    = useState(() => cacheValid ? homeFeedCache.trending  : []);
  const [urgent,      setUrgent]      = useState(() => cacheValid ? homeFeedCache.urgent    : []);
  const [feedLoading, setFeedLoading] = useState(!cacheValid);
  const [secLoading,  setSecLoading]  = useState(!cacheValid);
  const [error,       setError]       = useState(null);

  const searchRef         = useRef();
  const scrollRestoredRef = useRef(false);

  /* ── Fetch all data on mount (skip if cache is warm) ── */
  useEffect(() => {
    if (cacheRef.current.cache && (Date.now() - cacheRef.current.cacheTime < CACHE_TTL)) return;

    let mainEvents = null;
    let secEvents  = null;
    const trySaveCache = () => {
      if (mainEvents && secEvents) {
        setHomeFeedCache({ allEvents: mainEvents, ...secEvents });
        setHomeFeedCacheTime(Date.now());
      }
    };

    eventsApi.list({ limit: 50 })
      .then(r => { mainEvents = normaliseEvents(r.data.events); setAllEvents(mainEvents); trySaveCache(); })
      .catch(e => setError(e.message))
      .finally(() => setFeedLoading(false));

    Promise.all([eventsApi.trending(), eventsApi.urgent()])
      .then(([tr, ur]) => {
        const t = normaliseEvents(tr.data.events);
        const u = normaliseEvents(ur.data.events);
        setTrending(t);
        setUrgent(u);
        secEvents = { trending: t, urgent: u };
        trySaveCache();
      })
      .catch(err => { if (import.meta.env.DEV) console.error('[Home] rails fetch failed:', err); })
      .finally(() => setSecLoading(false));
  }, []);

  /* ── Restore scroll position when navigating back from an event page ── */
  useLayoutEffect(() => {
    if (scrollRestoredRef.current || allEvents.length === 0) return;
    const origin = sessionStorage.getItem('feed_scroll_origin');
    if (origin !== pathname) return;
    scrollRestoredRef.current = true;
    const winY  = parseInt(sessionStorage.getItem('feed_scroll_window') || '0', 10);
    const mainY = parseInt(sessionStorage.getItem('feed_scroll_main')   || '0', 10);
    window.scrollTo({ top: winY, left: 0, behavior: 'instant' });
    document.querySelector('main')?.scrollTo({ top: mainY, left: 0, behavior: 'instant' });
    sessionStorage.removeItem('feed_scroll_origin');
    sessionStorage.removeItem('feed_scroll_window');
    sessionStorage.removeItem('feed_scroll_main');
  }, [allEvents]);

  // In the unfiltered default feed, featured events (sorted by featuredOrder) float to the top.
  // Any active filter/search/category reverts to normal order.
  const isFiltered = !!(
    searchVal.trim() ||
    chipCategory !== 'all' ||
    sheetFilters.category ||
    (sheetFilters.entry && sheetFilters.entry !== 'All') ||
    sheetFilters.city
  );
  const _filtered = applyFilters(allEvents, chipCategory, sheetFilters, searchVal);
  const displayedEvents = isFiltered
    ? _filtered
    : [
        ..._filtered.filter(ev => ev.isFeatured).sort((a, b) => a.featuredOrder - b.featuredOrder),
        ..._filtered.filter(ev => !ev.isFeatured),
      ];

  const activeSheetCount = [sheetFilters.category, sheetFilters.entry, sheetFilters.city].filter(Boolean).length;
  const totalActiveFilters = activeSheetCount + (chipCategory !== 'all' ? 1 : 0);

  const clearAll = useCallback(() => {
    setChipCategory('all');
    setSheetFilters({ category: null, entry: null, city: null, sort: 'Latest' });
    setSearchVal('');
  }, []);

  const handleDeleteEvent = useCallback(async (eventId) => {
    await adminApi.hardDeleteEvent(eventId);
    setAllEvents(prev => prev.filter(ev => ev._id !== eventId));
    showToast('Event permanently deleted', 'success');
  }, [showToast]);

  const suggestions = [
    { text: 'HackBits 2025',          sub: 'IIT Bombay · Hackathon',  bg: 'bg1', Icon: Code2 },
    { text: 'Bangalore events',        sub: 'Location search',         bg: 'bg4', Icon: MapPin },
    { text: 'Cultural fests May 2025', sub: '78 events found',         bg: 'bg5', Icon: Music4 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="screen-enter bg-white min-h-screen">

      <Seo
        title="Discover College Events"
        description="Find and register for hackathons, cultural fests, workshops, and competitions at colleges across India. FestNest brings every college event together in one feed."
        canonical="/"
        jsonLd={HOME_JSON_LD}
      />

      {createPortal(
        <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={sheetFilters}
          setFilters={setSheetFilters} onApply={setSheetFilters} onReset={clearAll} activeCount={activeSheetCount} />,
        document.body
      )}

      {/* ── Notification banner ── */}
      <AnimatePresence>
        {notifBannerVisible && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="mx-4 mt-4 bg-[#EEF2FF] border border-[#C7D2FE] rounded-md p-4 flex items-center gap-3 md:mx-auto md:max-w-[1140px]">
            <div className="w-[38px] h-[38px] rounded bg-primary flex items-center justify-center flex-shrink-0 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-primary mb-0.5">Turn on notifications</div>
              <div className="text-[12px] text-primary-mid">Never miss a registration deadline again</div>
            </div>
            <button onClick={() => setNotifBannerVisible(false)} aria-label="Dismiss" className="text-primary-mid flex-shrink-0 hover:text-primary transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <div className="px-4 pt-5 pb-0 md:hero-desktop">
        <div className="flex items-center gap-2 text-[13px] text-text-3 mb-1">
          <span className="w-1.5 h-1.5 bg-[#16A34A] rounded-full animate-pulse-dot" aria-hidden />
          Good afternoon, Explorer
        </div>
        <h1 className="font-display font-bold text-[32px] md:text-[40px] text-text-1 leading-tight tracking-tight mb-0 md:mb-4">
          Find your next<br /><em className="text-primary not-italic">big moment</em>
        </h1>

        {/* Discover hub — internal SEO entry point */}
        <button onClick={() => navigate('/discover')}
          className="inline-flex items-center gap-1.5 mt-3 md:mt-0 mb-1 text-[13px] font-semibold text-primary hover:gap-2.5 transition-all duration-fast">
          <Compass size={15} strokeWidth={2} />
          Discover events by city &amp; category
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        {/* Search + Filter */}
        <div className="relative block mt-4 md:mt-0">
          <div className={`flex items-center gap-3 bg-white border-[1.5px] rounded-md px-4 py-[11px] transition-all duration-fast ${showSuggestions ? 'border-primary shadow-[0_0_0_3px_rgba(79,70,229,0.10)]' : 'border-[#CBCBC6]'}`} role="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-[18px] h-[18px] flex-shrink-0 transition-colors duration-fast ${showSuggestions ? 'text-primary' : 'text-[#8A8A85]'}`}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input ref={searchRef} value={searchVal} onChange={e => setSearchVal(e.target.value)}
              onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={e => { if (e.key === 'Escape') { setSearchVal(''); searchRef.current?.blur(); } }}
              className="flex-1 font-body text-[14px] text-[#111110] bg-transparent outline-none placeholder:text-[#8A8A85] min-w-0"
              placeholder="Events, colleges, cities…" aria-label="Search events" autoComplete="off" />
            <AnimatePresence>
              {searchVal && (
                <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                  onClick={() => { setSearchVal(''); searchRef.current?.focus(); }}
                  className="text-[#8A8A85] hover:text-[#111110] transition-colors flex-shrink-0" aria-label="Clear search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
                </motion.button>
              )}
            </AnimatePresence>
            <div className="w-px h-5 bg-[#E4E4E0] flex-shrink-0" />
            <button onClick={() => setFilterOpen(true)}
              className={`flex items-center gap-[5px] rounded px-[11px] py-1.5 text-[12px] font-semibold flex-shrink-0 active:scale-95 transition-all duration-fast relative ${activeSheetCount > 0 ? 'bg-primary text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filter
              {activeSheetCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeSheetCount}</span>
              )}
            </button>
          </div>
          <AnimatePresence>
            {showSuggestions && !searchVal && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-[#E4E4E0] rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-[50] overflow-hidden" role="listbox">
                <div className="px-4 pt-2.5 pb-1.5 text-[10px] font-bold tracking-wider text-[#AEAEAD] uppercase">Recent Searches</div>
                {suggestions.map(({ text, sub, bg, Icon: SugIcon }) => (
                  <button key={text} className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#F5F3FF] transition-colors border-t border-[#E4E4E0] text-left"
                    onMouseDown={() => { setSearchVal(text); setShowSuggestions(false); }} role="option">
                    <div className={`w-[34px] h-[34px] rounded ${bg} flex items-center justify-center flex-shrink-0`}><SugIcon size={18} strokeWidth={1.8} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-[#111110]">{text}</div>
                      <div className="text-[12px] text-[#8A8A85]">{sub}</div>
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#AEAEAD]"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active filter pills */}
      <AnimatePresence>
        {activeSheetCount > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-4 pt-2 overflow-x-auto no-scrollbar">
            <span className="text-[12px] text-[#8A8A85] flex-shrink-0">Filters:</span>
            {sheetFilters.category && <ActivePill label={sheetFilters.category} onRemove={() => setSheetFilters(f => ({ ...f, category: null }))} />}
            {sheetFilters.entry && sheetFilters.entry !== 'All' && <ActivePill label={sheetFilters.entry} onRemove={() => setSheetFilters(f => ({ ...f, entry: null }))} />}
            {sheetFilters.city && <ActivePill label={sheetFilters.city} onRemove={() => setSheetFilters(f => ({ ...f, city: null }))} />}
            <button onClick={() => setSheetFilters(f => ({ ...f, category: null, entry: null, city: null }))} className="text-[12px] font-semibold text-red flex-shrink-0 hover:underline">Clear all</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trending Now ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:section-hd-desktop">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-[16px] md:text-[18px] text-text-1 tracking-snug flex items-center gap-2"><Flame size={16} strokeWidth={1.8} className="text-red" /> Trending Now</h2>
          <span className="text-[10px] font-bold bg-primary-light text-primary px-[7px] py-[2px] rounded-md">Live</span>
        </div>
        <button onClick={() => navigate('/explore')} className="text-[13px] font-medium text-primary hover:opacity-70 transition-opacity">See all</button>
      </div>

      {secLoading ? <SkeletonHScroll count={5} /> : (
        <div className="flex gap-3 md:gap-4 px-4 scroll-px-4 md:hscroll-desktop overflow-x-auto no-scrollbar scroll-snap-x pb-2">
          {trending.map((ev) => (
            <motion.div key={ev.id} whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              onClick={() => {
                sessionStorage.setItem('feed_scroll_origin', pathname);
                sessionStorage.setItem('feed_scroll_window', String(window.scrollY));
                sessionStorage.setItem('feed_scroll_main', String(document.querySelector('main')?.scrollTop ?? 0));
                navigate(`/event/${ev.id}`);
              }}
              className="flex-shrink-0 w-[196px] md:w-[224px] bg-white border border-[#E4E4E0] rounded-md overflow-hidden cursor-pointer scroll-snap-start transition-all duration-base"
              tabIndex={0} role="listitem" onKeyDown={e => { if (e.key === 'Enter') navigate(`/event/${ev.id}`); }}>
              <div className={`relative w-full h-[116px] md:h-[136px] flex items-center justify-center text-[36px] ${ev.bg}`}>
                {ev.imageUrl
                  ? <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover" />
                  : <span aria-hidden>{ev.emoji}</span>}
                <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/55 text-white px-[7px] py-[2px] rounded-md tracking-wide z-[1]">#{ev.trendRank}</span>
              </div>
              <div className="p-3">
                <div className="text-[10px] font-bold tracking-wider uppercase text-primary mb-[3px]">{ev.category}</div>
                <div className="font-display font-bold text-[13px] md:text-[14px] text-text-1 leading-snug tracking-snug mb-[5px]">{ev.name}</div>
                <div className="flex items-center gap-1 text-[11px] text-text-3 mb-2"><PinIcon /> {ev.college}</div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-[3px] text-[11px] text-text-3"><FireIcon /> {ev.trendViews}</div>
                  <span className="text-[10px] font-bold text-primary">{ev.trendExtra}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Ending Soon ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:section-hd-desktop">
        <h2 className="font-display font-bold text-[16px] md:text-[18px] text-text-1 tracking-snug flex items-center gap-2"><Timer size={16} strokeWidth={1.8} className="text-amber" /> Ending Soon</h2>
        <button onClick={() => navigate('/explore')} className="text-[13px] font-medium text-primary hover:opacity-70 transition-opacity">See all</button>
      </div>

      {secLoading ? <SkeletonHScroll count={4} wide /> : (
        <div className="flex gap-3 px-4 scroll-px-4 md:hscroll-desktop overflow-x-auto no-scrollbar scroll-snap-x pb-2">
          {urgent.map((ev) => (
            <motion.div key={ev.id} whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              onClick={() => {
                sessionStorage.setItem('feed_scroll_origin', pathname);
                sessionStorage.setItem('feed_scroll_window', String(window.scrollY));
                sessionStorage.setItem('feed_scroll_main', String(document.querySelector('main')?.scrollTop ?? 0));
                navigate(`/event/${ev.id}`);
              }}
              className="flex-shrink-0 w-[236px] md:w-[270px] bg-white border border-[#E4E4E0] rounded-md overflow-hidden cursor-pointer scroll-snap-start flex transition-all duration-base"
              tabIndex={0} role="listitem" onKeyDown={e => { if (e.key === 'Enter') navigate(`/event/${ev.id}`); }}>
              <div className={`w-[78px] min-h-[78px] flex items-center justify-center text-[28px] flex-shrink-0 ${ev.bg}`}>
                {ev.imageUrl ? <img src={ev.imageUrl} alt={ev.name} className="w-full h-full object-cover" /> : ev.emoji}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-[5px] text-[10px] font-bold text-red bg-red-bg border border-red-border px-2 py-[2px] rounded-md w-fit mb-[5px] tracking-normal">
                  <span className="w-[5px] h-[5px] bg-red rounded-full animate-pulse-fast flex-shrink-0" />
                  {ev.deadlineDays} days left
                </div>
                <div className="font-display font-bold text-[12px] text-text-1 leading-snug mb-[3px] truncate">{ev.name}</div>
                <div className="text-[11px] text-text-3">{ev.college} · {ev.city}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Filter chips ── */}
      <div className="flex gap-2 px-4 pt-5 overflow-x-auto no-scrollbar md:filter-row-desktop md:flex-wrap md:overflow-x-visible">
        {CHIP_FILTERS.map(({ label, value, Icon: CfIcon }) => (
          <button key={value} onClick={() => setChipCategory(prev => prev === value ? 'all' : value)}
            className={`flex items-center gap-[6px] px-[14px] py-[7px] rounded-md border text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all duration-150 active:scale-95 select-none ${chipCategory === value ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-[#E4E4E0] text-[#4B4B47] hover:border-primary hover:text-primary hover:bg-[#F5F3FF] shadow-sm'}`}>
            <CfIcon size={13} strokeWidth={1.8} />{label}
          </button>
        ))}
      </div>

      {/* ── For You feed ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:section-hd-desktop">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-[16px] md:text-[18px] text-text-1 tracking-snug">For You</h2>
          {!feedLoading && <span className="text-[10px] font-bold bg-primary-light text-primary px-[7px] py-[2px] rounded-md">{displayedEvents.length}</span>}
          {totalActiveFilters > 0 && <span className="text-[11px] text-[#8A8A85]">· filtered</span>}
        </div>
        <SortDropdown value={sheetFilters.sort} onChange={v => setSheetFilters(f => ({ ...f, sort: v }))} />
      </div>

      {/* Error state */}
      {error && !feedLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <AlertTriangle size={56} strokeWidth={1.5} className="text-amber mb-4" />
          <div className="font-display font-bold text-[18px] text-text-1 mb-2">Could not load events</div>
          <div className="text-[14px] text-[#8A8A85] mb-6 max-w-[260px]">{error}</div>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-white rounded-md text-[14px] font-bold hover:bg-primary-dark transition-all">Retry</button>
        </motion.div>
      )}

      {/* Loading skeletons for feed */}
      {feedLoading && !error && (
        <div className="feed-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!feedLoading && !error && displayedEvents.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <Search size={56} strokeWidth={1.5} className="text-text-3 mb-4" />
          <div className="font-display font-bold text-[18px] text-text-1 mb-2">No events found</div>
          <div className="text-[14px] text-[#8A8A85] mb-6 max-w-[260px]">Try adjusting your search or removing some filters.</div>
          <button onClick={clearAll} className="px-6 py-3 bg-primary text-white rounded-md text-[14px] font-bold hover:bg-primary-dark hover:shadow-indigo transition-all">Clear All Filters</button>
        </motion.div>
      )}

      {/* Feed */}
      {!feedLoading && !error && displayedEvents.length > 0 && (
        <div className="feed-grid" role="list" aria-label="Event feed">
          {displayedEvents.map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, delay: Math.min(i * 0.04, 0.24) }}
              onClickCapture={() => {
                sessionStorage.setItem('feed_scroll_origin', pathname);
                sessionStorage.setItem('feed_scroll_window', String(window.scrollY));
                sessionStorage.setItem('feed_scroll_main', String(document.querySelector('main')?.scrollTop ?? 0));
              }}>
              <EventCard event={ev} onDelete={handleDeleteEvent} featured={ev.isFeatured || false} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="h-4" />
    </motion.div>
  );
}
