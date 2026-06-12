import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Timer, Star, CalendarDays, Code2, Music4, Wrench, Ticket, Trophy, AlertTriangle, Search, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import EventCard from '../components/EventCard';
import { events as eventsApi, admin as adminApi } from '../services/api';
import { normaliseEvents } from '../services/normalise';

/* ─────────────────────────────────────────
   FILTER CONFIG  (unchanged)
───────────────────────────────────────── */
const CHIP_FILTERS = [
  { label: 'All Events',    value: 'all',          Icon: Star },
  { label: 'This Week',     value: 'week',          Icon: CalendarDays },
  { label: 'Hackathon',     value: 'Hackathon',     Icon: Code2 },
  { label: 'Cultural Fest', value: 'Cultural Fest', Icon: Music4 },
  { label: 'Workshop',      value: 'Workshop',      Icon: Wrench },
  { label: 'Free Entry',    value: 'free',          Icon: Ticket },
  { label: 'Prize Pool',    value: 'prize',         Icon: Trophy },
];

const CITIES   = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Tiruchirappalli', 'Pilani', 'Vellore'];
const ENTRY    = ['All', 'Free', 'Paid', 'Prize Pool'];
const SORT_OPT = ['Latest', 'Oldest', 'Most Registered', 'Deadline Soon'];

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
  <div className="bg-white border border-border rounded-[18px] overflow-hidden animate-pulse">
    <div className="h-[156px] bg-surface-3" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-16 bg-surface-3 rounded-full" />
      <div className="h-5 w-3/4 bg-surface-3 rounded-full" />
      <div className="h-3 w-1/2 bg-surface-3 rounded-full" />
      <div className="h-10 bg-surface-3 rounded-md mt-4" />
    </div>
  </div>
);

const SkeletonHScroll = ({ count = 4, wide }) => (
  <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`flex-shrink-0 ${wide ? 'w-[236px]' : 'w-[196px]'} bg-white border border-border rounded-md overflow-hidden animate-pulse`}>
        <div className={`${wide ? 'h-[78px] w-[78px]' : 'h-[116px] w-full'} bg-surface-3`} />
        <div className="p-3 space-y-2">
          <div className="h-3 w-2/3 bg-surface-3 rounded-full" />
          <div className="h-3 w-1/2 bg-surface-3 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────────────────
   FILTER SHEET  (unchanged from original)
───────────────────────────────────────── */
function FilterSheet({ open, onClose, filters, setFilters, onApply, onReset, activeCount }) {
  const [local, setLocal] = useState(filters);
  const toggle = (key, val) => setLocal(prev => ({ ...prev, [key]: prev[key] === val ? null : val }));
  const handleApply = () => { setFilters(local); onApply(local); onClose(); };
  const handleReset = () => {
    const cleared = { category: null, entry: null, city: null, sort: 'Latest' };
    setLocal(cleared); setFilters(cleared); onApply(cleared); onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }} className="fixed inset-0 bg-black/40 z-[200]" onClick={onClose} />
          <motion.div key="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[201] bg-white rounded-t-lg max-w-[640px] mx-auto shadow-[0_-8px_40px_rgba(0,0,0,0.15)] max-h-[85vh] flex flex-col">
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-[#E4E4E0] rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E4E4E0] flex-shrink-0">
              <h3 className="font-display font-bold text-[18px] text-[#111110]">
                Filters
                {activeCount > 0 && <span className="ml-2 text-[12px] font-bold bg-primary text-white px-2 py-0.5 rounded-md">{activeCount}</span>}
              </h3>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F1F0ED] text-[#8A8A85] hover:bg-[#E4E4E0] transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <FilterSection title="Category">
                <div className="flex flex-wrap gap-2">
                  {['Hackathon','Cultural Fest','Workshop','Competition','Tech Talk','Sports'].map(cat => (
                    <Chip key={cat} label={cat} active={local.category === cat} onClick={() => toggle('category', cat)} />
                  ))}
                </div>
              </FilterSection>
              <FilterSection title="Entry Type">
                <div className="flex flex-wrap gap-2">
                  {ENTRY.map(e => <Chip key={e} label={e} active={local.entry === e} onClick={() => toggle('entry', e)} />)}
                </div>
              </FilterSection>
              <FilterSection title="City">
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(c => (
                    <Chip key={c} label={c} active={local.city === c || (!local.city && c === 'All Cities')} onClick={() => toggle('city', c === 'All Cities' ? null : c)} />
                  ))}
                </div>
              </FilterSection>
              <FilterSection title="Sort By" noBorder>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPT.map(s => <Chip key={s} label={s} active={local.sort === s} onClick={() => setLocal(prev => ({ ...prev, sort: s }))} />)}
                </div>
              </FilterSection>
            </div>
            <div className="flex gap-3 px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom,0px))] border-t border-[#E4E4E0] flex-shrink-0">
              <button onClick={handleReset} className="flex-1 py-3 border-[1.5px] border-[#E4E4E0] rounded-md text-[14px] font-semibold text-[#8A8A85] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all">Reset All</button>
              <button onClick={handleApply} className="flex-[2] py-3 bg-[#4F46E5] text-white rounded-md text-[14px] font-bold hover:bg-[#3730A3] hover:shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-all">Show Events</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const FilterSection = ({ title, children, noBorder }) => (
  <div className={`mb-5 ${!noBorder ? 'pb-5 border-b border-[#F1F0ED]' : ''}`}>
    <div className="text-[12px] font-bold tracking-wider uppercase text-[#8A8A85] mb-3">{title}</div>
    {children}
  </div>
);

const Chip = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-md border text-[13px] font-medium transition-all duration-150 ${active ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-sm' : 'bg-white border-[#E4E4E0] text-[#4B4B47] hover:border-[#4F46E5] hover:text-[#4F46E5]'}`}>
    {label}
  </button>
);

/* ─────────────────────────────────────────
   SORT DROPDOWN  (unchanged)
───────────────────────────────────────── */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-[13px] font-medium text-primary hover:opacity-70 transition-opacity">
        {value}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[50]" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.96 }} transition={{ duration: 0.15 }}
              className="absolute right-0 top-7 z-[51] bg-white border border-[#E4E4E0] rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden min-w-[160px]">
              {SORT_OPT.map(opt => (
                <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                  className={`flex items-center justify-between w-full px-4 py-3 text-[13px] font-medium transition-colors text-left ${value === opt ? 'bg-primary-light text-primary' : 'text-[#4B4B47] hover:bg-[#F5F3FF] hover:text-primary'}`}>
                  {opt}
                  {value === opt && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  const navigate = useNavigate();
  const { notifBannerVisible, setNotifBannerVisible, showToast } = useApp();

  const [searchVal,       setSearchVal]       = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [chipCategory,    setChipCategory]    = useState('all');
  const [filterOpen,      setFilterOpen]      = useState(false);
  const [sheetFilters,    setSheetFilters]    = useState({ category: null, entry: null, city: null, sort: 'Latest' });

  /* ── API state ── */
  const [allEvents,   setAllEvents]   = useState([]);
  const [trending,    setTrending]    = useState([]);
  const [urgent,      setUrgent]      = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [secLoading,  setSecLoading]  = useState(true);  // trending + urgent
  const [error,       setError]       = useState(null);

  const searchRef = useRef();

  /* ── Fetch all data on mount ── */
  useEffect(() => {
    // Main feed
    eventsApi.list({ limit: 50 })
      .then(r => setAllEvents(normaliseEvents(r.data.events)))
      .catch(e => setError(e.message))
      .finally(() => setFeedLoading(false));

    // Trending + Urgent in parallel
    Promise.all([eventsApi.trending(), eventsApi.urgent()])
      .then(([tr, ur]) => {
        setTrending(normaliseEvents(tr.data.events));
        setUrgent(normaliseEvents(ur.data.events));
      })
      .catch(console.error)
      .finally(() => setSecLoading(false));
  }, []);

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
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="screen-enter bg-white min-h-screen">

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

        {/* Search + Filter */}
        <div className="relative hidden md:block">
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

      {/* ── Filter chips ── */}
      <div className="flex gap-2 px-4 pt-4 overflow-x-auto no-scrollbar md:filter-row-desktop md:flex-wrap md:overflow-x-visible">
        {CHIP_FILTERS.map(({ label, value, Icon: CfIcon }) => (
          <button key={value} onClick={() => setChipCategory(prev => prev === value ? 'all' : value)}
            className={`flex items-center gap-[6px] px-[14px] py-[7px] rounded-md border text-[13px] font-medium whitespace-nowrap flex-shrink-0 transition-all duration-150 active:scale-95 select-none ${chipCategory === value ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-[#E4E4E0] text-[#4B4B47] hover:border-primary hover:text-primary hover:bg-[#F5F3FF] shadow-sm'}`}>
            <CfIcon size={13} strokeWidth={1.8} />{label}
          </button>
        ))}
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
        <div className="flex gap-3 md:gap-4 px-4 md:hscroll-desktop overflow-x-auto no-scrollbar scroll-snap-x pb-2">
          {trending.map((ev) => (
            <motion.div key={ev.id} whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              onClick={() => navigate(`/event/${ev.id}`)}
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
        <div className="flex gap-3 px-4 md:hscroll-desktop overflow-x-auto no-scrollbar scroll-snap-x pb-2">
          {urgent.map((ev) => (
            <motion.div key={ev.id} whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              onClick={() => navigate(`/event/${ev.id}`)}
              className="flex-shrink-0 w-[236px] md:w-[270px] bg-white border border-[#E4E4E0] rounded-md overflow-hidden cursor-pointer scroll-snap-start flex transition-all duration-base"
              tabIndex={0} role="listitem" onKeyDown={e => { if (e.key === 'Enter') navigate(`/event/${ev.id}`); }}>
              <div className={`w-[78px] min-h-[78px] flex items-center justify-center text-[28px] flex-shrink-0 ${ev.bg}`}>
                {ev.imageUrl ? <img src={ev.imageUrl} alt="" className="w-full h-full object-cover" /> : ev.emoji}
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
              transition={{ duration: 0.16, delay: Math.min(i * 0.04, 0.24) }}>
              <EventCard event={ev} onDelete={handleDeleteEvent} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="h-4" />
    </motion.div>
  );
}

function ActivePill({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-light border border-[#C7D2FE] text-primary rounded-md text-[12px] font-semibold flex-shrink-0">
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity" aria-label={`Remove ${label} filter`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </span>
  );
}
