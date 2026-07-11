import { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from '../components/EventCard';
import Seo from '../components/Seo';
import { events as eventsApi, admin as adminApi } from '../services/api';
import { normaliseEvents } from '../services/normalise';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';
import { FilterSheet, SortDropdown, ActivePill } from '../components/EventFilters';

// Priority-first category tiles from the shared catalog.
const EXPLORE_CATEGORIES = CATEGORIES.map(c => ({
  icon: c.Icon, name: c.label, value: c.value, color: c.tint,
}));

/* ── Skeleton ── */
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

export default function Explore() {
  const [searchParams] = useSearchParams();
  const { pathname }   = useLocation();
  const { showToast, exploreFeedCache, exploreFeedCacheTime, setExploreFeedCache, setExploreFeedCacheTime } = useApp();
  const CACHE_TTL = 5 * 60 * 1000;
  const cacheRef  = useRef({ cache: exploreFeedCache, cacheTime: exploreFeedCacheTime });
  cacheRef.current = { cache: exploreFeedCache, cacheTime: exploreFeedCacheTime };

  const [query,     setQuery]     = useState('');
  const [activeCat, setActiveCat] = useState(() => {
    const cat = searchParams.get('cat');
    return cat ? decodeURIComponent(cat) : 'all';
  });
  const [allEvents, setAllEvents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const scrollRestoredRef         = useRef(false);

  const [filterOpen,   setFilterOpen]   = useState(false);
  const [sheetFilters, setSheetFilters] = useState({ category: null, entry: null, city: null, sort: 'Latest' });

  /* Keep activeCat in sync when URL changes */
  useEffect(() => {
    const cat = searchParams.get('cat');
    setActiveCat(cat ? decodeURIComponent(cat) : 'all');
  }, [searchParams]);

  /* Keep the filter sheet's category in sync with the category grid */
  useEffect(() => {
    setSheetFilters(prev => ({ ...prev, category: activeCat === 'all' ? null : activeCat }));
  }, [activeCat]);

  const applySheetFilters = useCallback((f) => {
    setSheetFilters(f);
    setActiveCat(f.category || 'all');
  }, []);

  /* Fetch from API (skip if cache is warm and category matches) */
  const fetchEvents = useCallback(() => {
    const { cache, cacheTime } = cacheRef.current;
    if (cache && (Date.now() - cacheTime < CACHE_TTL) && cache.activeCat === activeCat) {
      setAllEvents(cache.allEvents);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const params = { limit: 100 };
    if (activeCat !== 'all') params.category = activeCat;
    eventsApi.list(params)
      .then(r => {
        const evts = normaliseEvents(r.data.events);
        setAllEvents(evts);
        setExploreFeedCache({ allEvents: evts, activeCat });
        setExploreFeedCacheTime(Date.now());
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeCat]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  /* Restore scroll position when navigating back from an event page */
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

  const handleDeleteEvent = useCallback(async (eventId) => {
    await adminApi.hardDeleteEvent(eventId);
    setAllEvents(prev => prev.filter(ev => ev._id !== eventId));
    showToast('Event permanently deleted', 'success');
  }, [showToast]);

  /* Client-side text + entry/city filter on top of the already-category-filtered API results */
  let filtered = allEvents.filter(ev => {
    if (query) {
      const q = query.toLowerCase();
      const matchesQuery = ev.name.toLowerCase().includes(q) ||
        ev.college.toLowerCase().includes(q) ||
        ev.city.toLowerCase().includes(q);
      if (!matchesQuery) return false;
    }
    if (sheetFilters.entry && sheetFilters.entry !== 'All') {
      const entryMap = { Free: 'free', Paid: 'paid', 'Prize Pool': 'prize' };
      if (ev.entryType !== entryMap[sheetFilters.entry]) return false;
    }
    if (sheetFilters.city && ev.city !== sheetFilters.city) return false;
    return true;
  });

  switch (sheetFilters.sort) {
    case 'Oldest':          filtered.sort((a, b) => b.deadlineDays - a.deadlineDays); break;
    case 'Most Registered': filtered.sort((a, b) => b.registrationCount - a.registrationCount); break;
    case 'Deadline Soon':   filtered.sort((a, b) => a.deadlineDays - b.deadlineDays); break;
    default: break;
  }

  /* Category counts from loaded data */
  const catCounts = allEvents.reduce((acc, ev) => {
    acc[ev.category] = (acc[ev.category] || 0) + 1;
    return acc;
  }, {});

  const activeSheetCount = [sheetFilters.category, sheetFilters.entry && sheetFilters.entry !== 'All' ? sheetFilters.entry : null, sheetFilters.city].filter(Boolean).length;

  const title = activeCat === 'all'
    ? (query ? `Results for "${query}"` : 'All Events')
    : activeCat + 's';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="bg-white min-h-screen w-full overflow-x-hidden">

      <Seo
        title="Explore All Events"
        description="Browse every college event on FestNest — hackathons, cultural fests, technical fests, workshops, and competitions across India. Filter by category and city."
        canonical="/explore"
      />

      {createPortal(
        <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={sheetFilters}
          setFilters={setSheetFilters} onApply={applySheetFilters}
          activeCount={activeSheetCount} />,
        document.body
      )}

      {/* Header */}
      <div className="px-4 pt-5 pb-4 md:px-12 md:pt-10">
        <h1 className="font-display font-bold text-[20px] md:text-[26px] text-text-1 tracking-tight mb-1">Explore</h1>
        <p className="text-[14px] text-text-3 mb-4">Discover events across India</p>
        <div className="flex items-center gap-3 bg-surface border-[1.5px] border-border-strong rounded-md px-4 py-[11px] focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(79,70,229,0.10)] transition-all max-w-[600px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-text-3 flex-shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={query} onChange={e => setQuery(e.target.value)}
            className="flex-1 font-body text-[14px] text-text-1 bg-transparent outline-none placeholder:text-text-3"
            placeholder="Search events, colleges, cities…" aria-label="Search" />
          {query && (
            <button onClick={() => setQuery('')} className="text-text-3 hover:text-text-1 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
            </button>
          )}
          <div className="w-px h-5 bg-[#E4E4E0] flex-shrink-0" />
          <button onClick={() => setFilterOpen(true)}
            className="flex items-center gap-[5px] rounded px-[11px] py-1.5 text-[12px] font-semibold flex-shrink-0 active:scale-95 transition-all duration-fast relative bg-primary text-white hover:bg-primary-dark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            Filter
            {activeSheetCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeSheetCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter pills */}
      <AnimatePresence>
        {(sheetFilters.entry && sheetFilters.entry !== 'All' || sheetFilters.city) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-4 md:px-12 pt-3 overflow-x-auto no-scrollbar">
            <span className="text-[12px] text-[#8A8A85] flex-shrink-0">Filters:</span>
            {sheetFilters.entry && sheetFilters.entry !== 'All' && <ActivePill label={sheetFilters.entry} onRemove={() => setSheetFilters(f => ({ ...f, entry: null }))} />}
            {sheetFilters.city && <ActivePill label={sheetFilters.city} onRemove={() => setSheetFilters(f => ({ ...f, city: null }))} />}
            <button onClick={() => setSheetFilters(f => ({ ...f, entry: null, city: null }))} className="text-[12px] font-semibold text-red flex-shrink-0 hover:underline">Clear all</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category grid */}
      <div className="section-hd-desktop">
        <h2 className="font-display font-bold text-[15px] md:text-[17px] text-text-1 px-4 md:px-0 mb-3">Categories</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4 md:px-12 mb-5 md:max-w-[1140px] md:mx-auto">
        {EXPLORE_CATEGORIES.map(({ icon: Icon, name, value, color }) => {
          const count = catCounts[value] || 0;
          return (
            <motion.button key={value} whileHover={{ y: -2, borderColor: '#4F46E5' }} whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCat(activeCat === value ? 'all' : value)}
              className={`flex flex-col gap-2 p-4 md:p-5 rounded-md border cursor-pointer transition-all duration-fast text-left shadow-sm ${activeCat === value ? 'border-primary bg-[#EEF2FF] shadow-[0_0_0_3px_rgba(79,70,229,0.08)]' : 'border-[#E4E4E0] bg-white hover:border-primary hover:bg-[#F5F3FF]'}`}>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" strokeWidth={1.75} />
              </div>
              <div className={`font-display font-bold text-[14px] md:text-[15px] ${activeCat === value ? 'text-primary' : 'text-text-1'} transition-colors`}>{name}</div>
              <div className="text-[12px] text-text-3">
                {loading ? '…' : `${count} event${count !== 1 ? 's' : ''}`}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Feed header */}
      <div className="flex items-center justify-between px-4 md:section-hd-desktop mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-[16px] md:text-[18px] text-text-1 tracking-snug">{title}</h2>
          {!loading && (
            <span className="text-[10px] font-bold bg-primary-light text-primary px-[7px] py-[2px] rounded-md">{filtered.length}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCat !== 'all' && (
            <button onClick={() => setActiveCat('all')} className="text-[13px] font-medium text-primary hover:opacity-70 transition-opacity">Clear</button>
          )}
          <SortDropdown value={sheetFilters.sort} onChange={v => setSheetFilters(f => ({ ...f, sort: v }))} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <div className="text-[48px] mb-4">⚠️</div>
          <div className="font-display font-bold text-[18px] text-text-1 mb-2">Could not load events</div>
          <div className="text-[14px] text-text-3 mb-4">{error}</div>
          <button onClick={fetchEvents} className="px-5 py-2.5 bg-primary text-white rounded-md text-[14px] font-semibold hover:bg-primary-dark transition-colors">Retry</button>
        </div>
      )}

      {/* Skeleton loading */}
      {loading && !error && (
        <div className="feed-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <div className="text-[48px] mb-4">🔍</div>
          <div className="font-display font-bold text-[18px] text-text-1 mb-2">No events found</div>
          <div className="text-[14px] text-text-3 mb-4">Try a different search or category.</div>
          <button onClick={() => { setActiveCat('all'); setQuery(''); }} className="px-5 py-2.5 bg-primary text-white rounded-md text-[14px] font-semibold hover:bg-primary-dark transition-colors">Clear Filters</button>
        </div>
      )}

      {/* Feed */}
      {!loading && !error && filtered.length > 0 && (
        <div className="feed-grid" role="list">
          {filtered.map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: Math.min(i * 0.03, 0.2) }}
              onClickCapture={() => {
                sessionStorage.setItem('feed_scroll_origin', pathname);
                sessionStorage.setItem('feed_scroll_window', String(window.scrollY));
                sessionStorage.setItem('feed_scroll_main', String(document.querySelector('main')?.scrollTop ?? 0));
              }}>
              <EventCard event={ev} onDelete={handleDeleteEvent} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
