// src/pages/seo/CityPage.jsx
// SEO landing page for a single city — route: /events/:city
// Targets searches like "hackathons in Chennai", "college fests in Delhi".
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Compass } from 'lucide-react';
import EventCard from '../../components/EventCard';
import Seo, { SITE_URL } from '../../components/Seo';
import { events as eventsApi, admin as adminApi } from '../../services/api';
import { normaliseEvents } from '../../services/normalise';
import { useApp } from '../../context/AppContext';

/* Title-case a URL slug: "new-delhi" → "New Delhi" */
const prettyCity = (slug = '') =>
  slug
    .replace(/-/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

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

export default function CityPage() {
  const { city: citySlug = '' } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const city = prettyCity(citySlug);

  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchEvents = useCallback(() => {
    setLoading(true);
    setError(null);
    eventsApi.list({ city, limit: 100 })
      .then(r => setEvents(normaliseEvents(r.data.events)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [city]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDeleteEvent = useCallback(async (eventId) => {
    await adminApi.hardDeleteEvent(eventId);
    setEvents(prev => prev.filter(ev => ev._id !== eventId));
    showToast('Event permanently deleted', 'success');
  }, [showToast]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="bg-white min-h-screen w-full overflow-x-hidden">

      <Seo
        title={`College Events in ${city} 2025`}
        description={`Discover hackathons, cultural fests, workshops and inter-college competitions happening in ${city}. Browse events from top colleges on FestNest.`}
        canonical={`${SITE_URL}/events/${citySlug.toLowerCase()}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `College Events in ${city}`,
          url: `${SITE_URL}/events/${citySlug.toLowerCase()}`,
          about: `College events, fests, hackathons and competitions in ${city}, India`,
        }}
      />

      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 md:px-12 md:pt-10">
        <button onClick={() => navigate('/discover')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:opacity-70 transition-opacity mb-3">
          <Compass size={14} strokeWidth={2} /> Discover
        </button>

        <div className="flex items-center gap-2 text-[13px] text-text-3 mb-1">
          <MapPin size={15} strokeWidth={2} className="text-primary" /> {city}, India
        </div>
        <h1 className="font-display font-bold text-[26px] md:text-[34px] text-text-1 leading-tight tracking-tight mb-3">
          College Events in {city}
        </h1>
        <p className="text-[14px] md:text-[15px] text-text-2 leading-relaxed max-w-[680px]">
          Looking for college events in {city}? FestNest gathers every hackathon, cultural fest,
          workshop, and inter-college competition happening in {city} into one place. Discover events
          hosted by the top colleges in {city}, register in a tap, and never miss a deadline again.
        </p>
      </div>

      {/* ── Feed header ── */}
      <div className="flex items-center justify-between px-4 md:section-hd-desktop mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-[16px] md:text-[18px] text-text-1 tracking-snug">
            Events in {city}
          </h2>
          {!loading && !error && (
            <span className="text-[10px] font-bold bg-primary-light text-primary px-[7px] py-[2px] rounded-md">{events.length}</span>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <div className="text-[48px] mb-4">⚠️</div>
          <div className="font-display font-bold text-[18px] text-text-1 mb-2">Could not load events</div>
          <div className="text-[14px] text-text-3 mb-4">{error}</div>
          <button onClick={fetchEvents} className="px-5 py-2.5 bg-primary text-white rounded-md text-[14px] font-semibold hover:bg-primary-dark transition-colors">Retry</button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && !error && (
        <div className="feed-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && events.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <div className="text-[48px] mb-4">📍</div>
          <div className="font-display font-bold text-[18px] text-text-1 mb-2">No events yet in {city} — check back soon</div>
          <div className="text-[14px] text-text-3 mb-4">We add new college events every week. Explore events across India in the meantime.</div>
          <button onClick={() => navigate('/discover')} className="px-5 py-2.5 bg-primary text-white rounded-md text-[14px] font-semibold hover:bg-primary-dark transition-colors">Discover all events</button>
        </div>
      )}

      {/* ── Feed ── */}
      {!loading && !error && events.length > 0 && (
        <div className="feed-grid" role="list">
          {events.map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: Math.min(i * 0.03, 0.2) }}>
              <EventCard event={ev} onDelete={handleDeleteEvent} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="h-4" />
    </motion.div>
  );
}
